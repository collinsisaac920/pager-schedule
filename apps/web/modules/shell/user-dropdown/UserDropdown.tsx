"use client";

import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { resetUser, track } from "@lib/analytics";
import { signOut } from "next-auth/react";
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

export function UserDropdown({ small }: UserDropdownProps) {
  const { data: user, isPending } = useMeQuery();
  const [open, setOpen] = useState(false);
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
      const id = setInterval(() => { if (sendSessionData()) clearInterval(id); }, 1000);
      return () => clearInterval(id);
    }
  }, [user?.username]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  if (!user && !isPending) return null;

  const initials = getInitials(user?.name);
  const displayName = isPending ? "Loading..." : (user?.name ?? "User");

  if (small) {
    return (
      <div style={{ position: "relative" }}>
        <button
          ref={triggerRef}
          type="button"
          disabled={isPending}
          onClick={() => setOpen(!open)}
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
        {open && <DropdownMenu onClose={() => setOpen(false)} ref={menuRef} />}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={isPending}
        data-testid="user-dropdown-trigger-button"
        onClick={() => setOpen(!open)}
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
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && <DropdownMenu onClose={() => setOpen(false)} ref={menuRef} />}
    </div>
  );
}

import { forwardRef } from "react";

const DropdownMenu = forwardRef<HTMLDivElement, { onClose: () => void }>(function DropdownMenu(
  { onClose },
  ref
) {
  const handleSignOut = async () => {
    onClose();
    try {
      track("user_logged_out", {});
      resetUser();
    } catch {
      // ignore analytics errors
    }
    await signOut({ callbackUrl: "/auth/logout" });
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 14px",
    color: "#374151",
    textDecoration: "none",
    fontSize: 14,
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.1s",
  };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: 0,
        right: 0,
        minWidth: 200,
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        zIndex: 9999,
        overflow: "hidden",
      }}>
      <a
        href="/settings/my-account/profile"
        style={itemStyle}
        onClick={onClose}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        My Profile
      </a>

      <a
        href="/settings/my-account/general"
        style={itemStyle}
        onClick={onClose}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
        Settings
      </a>

      <a
        href="/settings/my-account/out-of-office"
        style={itemStyle}
        onClick={onClose}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
        Out of Office
      </a>

      <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

      <a
        href="/settings/billing"
        style={itemStyle}
        onClick={onClose}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
        Billing
      </a>

      <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />

      <button
        type="button"
        style={{ ...itemStyle, color: "#ef4444" }}
        onClick={handleSignOut}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        Sign Out
      </button>
    </div>
  );
});
