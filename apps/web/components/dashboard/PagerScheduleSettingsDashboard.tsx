"use client";

import { useTheme } from "@lib/theme-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface PagerScheduleSettingsDashboardProps {
  children: ReactNode;
}

function WaveformLogo({ size = 34 }: { size?: number }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.265),
          background: `linear-gradient(135deg, ${theme.brandPrimary} 0%, ${theme.brandPrimary}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.round(size * 0.09),
          flexShrink: 0,
          boxShadow: `0 4px 14px ${alpha(theme.brandPrimary, 0.3)}`,
        }}>
        {([0.55, 1, 0.75, 0.45] as number[]).map((h, i) => (
          <span
            key={i}
            style={{
              width: Math.round(size * 0.14),
              height: Math.round(size * 0.44 * h),
              background: i === 1 ? "white" : `rgba(255,255,255,${h})`,
              borderRadius: 2,
              display: "inline-block",
            }}
          />
        ))}
      </div>
      <div>
        <div
          style={{
            fontSize: Math.round(size * 0.47),
            fontWeight: 700,
            color: `${theme.inkColor}`,
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}>
          Pager
        </div>
        <div
          style={{
            fontSize: Math.round(size * 0.27),
            fontWeight: 700,
            color: `${theme.brandPrimary}`,
            letterSpacing: Math.round(size * 0.053),
            lineHeight: 1,
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          }}>
          SCHEDULE
        </div>
      </div>
    </div>
  );
}

function SvgIcon({ d, size = 16, strokeWidth = 2 }: { d: string; size?: number; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  arrowLeft: "M19 12H5M12 5l-7 7 7 7",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  chevronRight: "M9 18l6-6-6-6",
  check: "M20 6L9 17l-5-5",
};

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const NAV_ACCOUNT = [
  { label: "Profile", href: "/settings/my-account/profile" },
  { label: "General", href: "/settings/my-account/general" },
  { label: "Calendars", href: "/settings/my-account/calendars" },
  { label: "Conferencing", href: "/settings/my-account/conferencing" },
  { label: "Appearance", href: "/settings/my-account/appearance" },
  { label: "Out of office", href: "/settings/my-account/out-of-office" },
  { label: "Push notifications", href: "/settings/my-account/push-notifications" },
];

const NAV_SECURITY = [
  { label: "Password", href: "/settings/security/password" },
  { label: "Two-factor auth", href: "/settings/security/two-factor-auth" },
];

const NAV_DEVELOPER = [
  { label: "Webhooks", href: "/settings/developer/webhooks" },
  { label: "OAuth", href: "/settings/developer/oauth" },
  { label: "API Keys", href: "/settings/developer/api-keys" },
  { label: "API Docs", href: "/docs" },
];

const PAGE_LABELS: Record<string, string> = {
  "/settings/my-account/profile": "Profile",
  "/settings/my-account/general": "General",
  "/settings/my-account/calendars": "Calendars",
  "/settings/my-account/conferencing": "Conferencing",
  "/settings/my-account/appearance": "Appearance",
  "/settings/my-account/out-of-office": "Out of office",
  "/settings/my-account/push-notifications": "Push notifications",
  "/settings/security/password": "Password",
  "/settings/security/two-factor-auth": "Two-factor auth",
  "/settings/developer/webhooks": "Webhooks",
  "/settings/developer/oauth": "OAuth",
  "/settings/developer/api-keys": "API Keys",
};

function NavGroup({
  label,
  icon,
  items,
  pathname,
}: {
  label: string;
  icon: string;
  items: { label: string; href: string }[];
  pathname: string;
}) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  return (
    <div style={{ marginBottom: 4 }}>
      {/* Group header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 14px 4px",
          fontSize: 10.5,
          fontWeight: 700,
          color: `${theme.mutedColor}`,
          textTransform: "uppercase",
          letterSpacing: 0.9,
        }}>
        <SvgIcon d={icon} size={12} strokeWidth={2.5} />
        {label}
      </div>
      {/* Items */}
      <div style={{ padding: "0 8px" }}>
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 10px",
                borderRadius: 8,
                background: active ? `${theme.brandSoft}` : "transparent",
                color: active ? `${theme.brandPrimary}` : `${theme.slateColor}`,
                fontSize: 13.5,
                fontWeight: active ? 600 : 400,
                marginBottom: 1,
                textDecoration: "none",
                transition: "all .15s",
              }}>
              <span>{item.label}</span>
              {active && (
                <span style={{ color: `${theme.brandPrimary}`, opacity: 0.6 }}>
                  <SvgIcon d={ICONS.chevronRight} size={13} strokeWidth={2.5} />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PagerScheduleSettingsDashboard({ children }: PagerScheduleSettingsDashboardProps) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");

  const pathname = usePathname() ?? "";
  const [savedVisible, setSavedVisible] = useState(false);

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const pageLabel = PAGE_LABELS[pathname] ?? "Settings";

  // Listen for save events dispatched by settings forms
  useEffect(() => {
    const handleSaved = () => {
      setSavedVisible(true);
      const timer = setTimeout(() => setSavedVisible(false), 2500);
      return () => clearTimeout(timer);
    };
    window.addEventListener("pager:settings-saved", handleSaved);
    return () => window.removeEventListener("pager:settings-saved", handleSaved);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 30,
        display: "flex",
        fontFamily: FONT,
        overflow: "hidden",
      }}>
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: 224,
          background: theme.sidebarBg,
          borderRight: `1px solid ${theme.border}`,
          boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflowY: "auto",
        }}>
        {/* Back button */}
        <div style={{ padding: "18px 8px 10px" }}>
          <Link
            href="/event-types"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 10px",
              borderRadius: 8,
              color: "#64748b",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all .15s",
            }}>
            <SvgIcon d={ICONS.arrowLeft} size={15} strokeWidth={2} />
            Back
          </Link>
        </div>

        {/* HR */}
        <div style={{ height: 1, background: `${theme.border}`, margin: "0 14px 14px" }} />

        {/* User row */}
        <div style={{ padding: "0 10px 16px" }}>
          <div
            style={{
              background: `${theme.pageBg}`,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.brandPrimary}, ${theme.brandPrimary}cc)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                letterSpacing: 0.5,
              }}>
              {initials || "PS"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: `${theme.inkColor}`,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                {userName}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: `${theme.mutedColor}`,
                  marginTop: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, paddingBottom: 16 }}>
          <NavGroup label="Account" icon={ICONS.user} items={NAV_ACCOUNT} pathname={pathname} />
          <div style={{ height: 1, background: `${theme.border}`, margin: "8px 14px" }} />
          <NavGroup label="Security" icon={ICONS.shield} items={NAV_SECURITY} pathname={pathname} />
          <div style={{ height: 1, background: `${theme.border}`, margin: "8px 14px" }} />
          <NavGroup label="Developer" icon={ICONS.terminal} items={NAV_DEVELOPER} pathname={pathname} />
        </nav>

        {/* Footer */}
        <div
          style={{
            borderTop: `1px solid ${theme.border}`,
            padding: "12px 12px 16px",
          }}>
          <div
            style={{
              fontSize: 11,
              color: `${theme.mutedColor}`,
              opacity: 0.6,
              lineHeight: 1.5,
            }}>
            © 2026 Pager Schedule v.8.2.0
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* TOP BAR */}
        <div
          style={{
            height: 62,
            background: theme.cardBg,
            borderBottom: `1px solid ${theme.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            padding: "0 30px",
            gap: 16,
            flexShrink: 0,
          }}>
          {/* Breadcrumb */}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: `${theme.mutedColor}` }}>Settings</span>
            <span style={{ fontSize: 13, color: `${theme.mutedColor}`, margin: "0 7px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: `${theme.slateColor}` }}>{pageLabel}</span>
          </div>

          {/* Saved badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 20,
              background: savedVisible ? "#dcfce7" : "transparent",
              color: savedVisible ? "#16a34a" : "transparent",
              fontSize: 12.5,
              fontWeight: 600,
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
              border: savedVisible ? "1px solid #bbf7d0" : "1px solid transparent",
            }}>
            <SvgIcon d={ICONS.check} size={13} strokeWidth={2.5} />
            Saved
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: `${theme.border}`, flexShrink: 0 }} />

          {/* Logo */}
          <WaveformLogo size={26} />
        </div>

        {/* CONTENT AREA */}
        <main
          style={{
            flex: 1,
            background: `${theme.pageBg}`,
            overflowY: "auto",
            padding: "30px 40px",
          }}>
          <div style={{ maxWidth: 900 }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
