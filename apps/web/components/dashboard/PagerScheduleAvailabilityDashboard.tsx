"use client";

import { useTheme } from "@lib/theme-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PagerScheduleAvailabilityDashboardProps {
  children: ReactNode;
  hiddenCtaSlot?: ReactNode;
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
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
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
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  bookings:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  grid: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  chevronDown: "M19 9l-7 7-7-7",
  externalLink: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  plus: "M12 5v14M5 12h14",
};

const NAV_ITEMS = [
  { label: "Event Types", href: "/event-types", icon: ICONS.calendar, active: false },
  { label: "Bookings", href: "/bookings/upcoming", icon: ICONS.bookings, active: false },
  { label: "Availability", href: "/availability", icon: ICONS.clock, active: true },
  { label: "Apps", href: "/apps", icon: ICONS.grid, active: false },
];

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export function PagerScheduleAvailabilityDashboard({
  children,
  hiddenCtaSlot,
}: PagerScheduleAvailabilityDashboardProps) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");

  const userName = session?.user?.name ?? "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Full-screen premium overlay — z-30 covers Cal shell sidebar/topnav */}
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
          {/* Logo */}
          <div style={{ padding: "22px 20px 18px" }}>
            <WaveformLogo size={34} />
          </div>

          {/* HR */}
          <div style={{ height: 1, background: `${theme.border}`, margin: "0 16px 14px" }} />

          {/* User pill */}
          <div style={{ padding: "0 12px 16px" }}>
            <div
              style={{
                background: `${theme.pageBg}`,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
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
                {initials || "IO"}
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
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>Admin</div>
              </div>
              <div style={{ color: `${theme.mutedColor}`, flexShrink: 0 }}>
                <SvgIcon d={ICONS.chevronDown} size={14} />
              </div>
            </div>
          </div>

          {/* MENU label */}
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: `${theme.mutedColor}`,
              textTransform: "uppercase",
              letterSpacing: 1,
              padding: "0 20px 8px",
            }}>
            Menu
          </div>

          {/* Nav items */}
          <nav style={{ padding: "0 10px", flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: item.active ? `${theme.brandSoft}` : "transparent",
                  color: item.active ? `${theme.brandPrimary}` : `${theme.slateColor}`,
                  fontSize: 13.5,
                  fontWeight: item.active ? 600 : 400,
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "all .15s",
                }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: item.active ? `${alpha(theme.brandPrimary, 0.12)}` : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background .15s",
                  }}>
                  <SvgIcon d={item.icon} size={15} />
                </div>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div style={{ borderTop: `1px solid ${theme.border}`, padding: "12px 10px 0" }}>
            {[
              { label: "View public page", href: "/", icon: ICONS.externalLink },
              { label: "Copy public link", href: "#", icon: ICONS.link },
              { label: "Settings", href: "/settings/my-account/general", icon: ICONS.settings },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: `${theme.mutedColor}`,
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "all .15s",
                  marginBottom: 1,
                }}>
                <SvgIcon d={item.icon} size={14} />
                {item.label}
              </Link>
            ))}
            <div
              style={{
                fontSize: 11,
                color: `${theme.mutedColor}`,
                opacity: 0.55,
                padding: "10px 12px 14px",
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
              boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              padding: "0 30px",
              gap: 16,
              flexShrink: 0,
            }}>
            {/* Breadcrumb */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: `${theme.mutedColor}` }}>Dashboard</span>
              <span style={{ fontSize: 13, color: "#d1d5db", margin: "0 7px" }}>›</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: `${theme.slateColor}` }}>Availability</span>
            </div>

            {/* New button — opens NewScheduleButton dialog via ?dialog=new-schedule */}
            <Link
              href="?dialog=new-schedule"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 9,
                background: `linear-gradient(135deg, ${theme.brandPrimary} 0%, ${theme.brandPrimary}cc 100%)`,
                color: "white",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: `0 2px 10px ${alpha(theme.brandPrimary, 0.35)}`,
                whiteSpace: "nowrap",
                letterSpacing: "-0.1px",
              }}>
              <SvgIcon d={ICONS.plus} size={14} strokeWidth={2.5} />
              New
            </Link>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: `${theme.border}`, flexShrink: 0 }} />

            {/* Logo */}
            <WaveformLogo size={26} />
          </div>

          {/* CONTENT AREA */}
          <main style={{ flex: 1, background: `${theme.pageBg}`, overflowY: "auto", padding: "30px" }}>
            {/* Page heading */}
            <div style={{ marginBottom: 24 }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: `${theme.inkColor}`,
                  letterSpacing: "-0.4px",
                  margin: "0 0 6px",
                  fontFamily: FONT,
                }}>
                Availability
              </h1>
              <p style={{ fontSize: 14, color: `${theme.mutedColor}`, margin: 0, lineHeight: 1.5 }}>
                Configure times when you are available for bookings.
              </p>
            </div>

            {/* Availability content — existing functional component */}
            <div
              style={{
                background: theme.cardBg,
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                overflow: "hidden",
                padding: "20px 24px 24px",
              }}>
              {children}
            </div>

            {/* Hidden slot keeps NewScheduleButton dialog mounted for ?dialog=new-schedule */}
            {hiddenCtaSlot && (
              <div
                style={{
                  position: "absolute",
                  visibility: "hidden",
                  height: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}>
                {hiddenCtaSlot}
              </div>
            )}
          </main>
        </div>
      </div>

    </>
  );
}
