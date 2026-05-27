"use client";

import { resetUser, track } from "@lib/analytics";
import { signOut, useSession } from "next-auth/react";
import { useRef, useState } from "react";

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

export function UserDropdown({ small }: UserDropdownProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 220 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (status === "unauthenticated") return null;

  const name = session?.user?.name;
  const email = session?.user?.email;
  const initials = getInitials(name);
  const displayName = status === "loading" ? "Loading..." : (name ?? "User");

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 220),
      });
    }
    setOpen((prev) => !prev);
  };

  // Full-screen transparent overlay catches outside clicks.
  // Menu uses position:fixed so it escapes the sidebar's overflow:hidden
  // without needing createPortal (no portal = no hidden-style inheritance race).
  const menuContent = open ? (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{ position: "fixed", inset: 0, zIndex: 9990 }}
      />
      <div
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          zIndex: 9999,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #e2e8f0",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}>
        {/* Name + email header */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{name ?? "User"}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{email ?? ""}</div>
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
      </div>
    </>
  ) : null;

  if (small) {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          data-testid="user-dropdown-trigger-button"
          onClick={handleToggle}
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
        {menuContent}
      </>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid="user-dropdown-trigger-button"
        onClick={handleToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 10px",
          borderRadius: 10,
          background: open ? "#f0effe" : "transparent",
          border: `1px solid ${open ? "#c4b5fd" : "transparent"}`,
          cursor: "pointer",
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
      {menuContent}
    </>
  );
}
