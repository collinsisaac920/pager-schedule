"use client";

import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { resetUser, track } from "@lib/analytics";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Support?: {
      open: () => void;
      shouldShowTriggerButton: (showTrigger: boolean) => void;
    };
    Beacon?: BeaconFunction;
  }
}

type BeaconFunction = {
  (command: "session-data", data: Record<string, string | number>): void;
  (...args: unknown[]): void;
};

interface UserDropdownProps {
  small?: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

type MenuPosition = { top: number; left: number; width: number };

export function UserDropdown({ small }: UserDropdownProps) {
  const { data: user, isPending } = useMeQuery();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0, width: 200 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Beacon session data
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sendSessionData = () => {
      const Beacon = window.Beacon;
      if (Beacon) {
        Beacon("session-data", {
          username: user?.username || "Unknown",
          screenResolution: `${screen.width}x${screen.height}`,
        });
        return true;
      }
      return false;
    };
    if (!sendSessionData()) {
      const id = setInterval(() => {
        if (sendSessionData()) clearInterval(id);
      }, 1000);
      return () => clearInterval(id);
    }
  }, [user?.username]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!user && !isPending) return null;

  const initials = getInitials(user?.name);
  const displayName = isPending ? "Loading..." : (user?.name ?? "User");

  const handleToggle = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        // Open BELOW the trigger — the trigger is near the top of the screen
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
    setOpen((prev) => !prev);
  };

  // Portal renders into document.body — escapes sidebar overflow and z-index constraints
  const menuEl =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              zIndex: 99999,
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}>
            {/* Name + email header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {user?.name ?? "User"}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {user?.email ?? ""}
              </div>
            </div>

            {/* Links */}
            {(
              [
                { label: "👤  My Profile", href: "/settings/my-account/profile" },
                { label: "⚙️  Settings", href: "/settings/my-account/general" },
                { label: "🌙  Out of Office", href: "/settings/my-account/out-of-office" },
                { label: "💳  Billing", href: "/settings/billing" },
              ] as const
            ).map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "#374151",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}>
                {item.label}
              </a>
            ))}

            <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

            {/* Sign Out */}
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                try {
                  track("user_logged_out", {});
                  resetUser();
                } catch {
                  // ignore analytics errors
                }
                await signOut({ callbackUrl: "/auth/logout" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                width: "100%",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
                fontSize: 14,
                textAlign: "left",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fef2f2";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}>
              🚪  Sign Out
            </button>
          </div>,
          document.body
        )
      : null;

  if (small) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          disabled={isPending}
          data-testid="user-dropdown-trigger-button"
          onClick={handleToggle}
          aria-expanded={open}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#818cf8)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
          }}>
          {initials}
        </button>
        {menuEl}
      </>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={isPending}
        data-testid="user-dropdown-trigger-button"
        onClick={handleToggle}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 10,
          background: open ? "#f0effe" : "transparent",
          border: `1px solid ${open ? "#c4b5fd" : "transparent"}`,
          cursor: isPending ? "not-allowed" : "pointer",
          width: "100%",
          textAlign: "left",
          transition: "background 0.15s, border-color 0.15s",
        }}>
        {/* Avatar */}
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#6366f1,#818cf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}>
          {initials}
        </div>
        {/* Name */}
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
          {displayName}
        </span>
        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {menuEl}
    </>
  );
}
