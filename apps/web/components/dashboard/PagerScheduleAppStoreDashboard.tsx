"use client";

import { trpc } from "@calcom/trpc/react";
import { useTheme } from "@lib/theme-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

interface PagerScheduleAppStoreDashboardProps {
  children?: ReactNode;
  searchText: string;
  setSearchText: (v: string) => void;
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

function SvgIcon({
  d,
  size = 16,
  strokeWidth = 2,
  fill = "none",
}: {
  d: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
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
  chevronRight: "M9 18l6-6-6-6",
  externalLink: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
};

// ── App Logo Components ────────────────────────────────────────────────────

function AppleCalendarLogo({ size = 52 }: { size?: number }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.2),
        overflow: "hidden",
        border: `1px solid ${theme.border}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        background: theme.cardBg,
        flexShrink: 0,
      }}>
      <div
        style={{
          height: "36%",
          background: "#FF3B30",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <span
          style={{
            color: "white",
            fontWeight: 700,
            letterSpacing: "1.5px",
            fontSize: Math.round(size * 0.15),
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            textTransform: "uppercase",
          }}>
          JUL
        </span>
      </div>
      <div
        style={{
          flex: 1,
          background: theme.cardBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <span
          style={{
            color: "#1c1c1e",
            fontWeight: 200,
            fontSize: Math.round(size * 0.46),
            lineHeight: 1,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
          }}>
          17
        </span>
      </div>
    </div>
  );
}

function ExchangeLogo({ size = 52 }: { size?: number }) {
  const inner = Math.round(size * 0.72);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.2),
        background: "linear-gradient(145deg, #0078D4 0%, #00BCF2 100%)",
        boxShadow: "0 2px 12px rgba(0,120,212,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
      <svg width={inner} height={inner} viewBox="0 0 36 36" fill="none" strokeLinecap="round">
        {/* Vertical bar of E */}
        <rect x="5" y="7" width="3.5" height="22" rx="1.5" fill="white" />
        {/* Top bar */}
        <rect x="5" y="7" width="15" height="3.5" rx="1.5" fill="white" />
        {/* Middle bar */}
        <rect x="5" y="16.25" width="12" height="3.5" rx="1.5" fill="white" />
        {/* Bottom bar */}
        <rect x="5" y="25.5" width="15" height="3.5" rx="1.5" fill="white" />
        {/* Arrow */}
        <line x1="24" y1="18" x2="31" y2="18" stroke="white" strokeWidth="3.5" />
        <polyline points="27,13.5 31.5,18 27,22.5" fill="none" stroke="white" strokeWidth="3.5" />
      </svg>
    </div>
  );
}

function AppLogo({ logo, size = 52 }: { logo: string; size?: number }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  if (logo === "apple") return <AppleCalendarLogo size={size} />;
  if (logo === "exchange" || logo === "exchange2016") return <ExchangeLogo size={size} />;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.2),
        background: `linear-gradient(135deg, ${theme.brandPrimary}, ${theme.brandPrimary}cc)`,
        flexShrink: 0,
      }}
    />
  );
}

// ── Static data ────────────────────────────────────────────────────────────

type FeaturedCat = {
  name: string;
  icon: string;
  color: string;
  bg: string;
  count: number;
  href: string;
};

function getFeaturedCats(t: { brandPrimary: string; brandSoft: string; brandAccent: string; successColor: string }): FeaturedCat[] {
  return [
    {
      name: "Calendar",
      icon: ICONS.calendar,
      color: t.brandPrimary,
      bg: t.brandSoft,
      count: 3,
      href: "/apps/categories/calendar",
    },
    {
      name: "Video",
      icon: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
      color: t.brandAccent,
      bg: "#e8f0ff",
      count: 5,
      href: "/apps/categories/video",
    },
    {
      name: "Automation",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: t.successColor,
      bg: "#e6faf4",
      count: 4,
      href: "/apps/categories/automation",
    },
    {
      name: "Payments",
      icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
      color: "#f59e0b",
      bg: "#fef3c7",
      count: 2,
      href: "/apps/categories/payment",
    },
    {
      name: "CRM",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      color: "#8b5cf6",
      bg: "#ede9fe",
      count: 6,
      href: "/apps/categories/crm",
    },
  ];
}

const POPULAR_APPS = [
  {
    name: "Apple Calendar",
    logo: "apple",
    desc: "Apple Calendar runs on macOS and iOS. Offering online cloud backup using Apple's iCloud service.",
    href: "/apps/applecalendar",
  },
  {
    name: "Microsoft Exchange",
    logo: "exchange",
    desc: "Fetch Microsoft Exchange calendars and availabilities using Exchange Web Services (EWS).",
    href: "/apps/exchangecalendar",
  },
  {
    name: "Microsoft Exchange 2016 Calendar",
    logo: "exchange2016",
    desc: "For calendars hosted on on-premises Microsoft Exchange 2016 servers.",
    href: "/apps/exchange2016calendar",
  },
];

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// ── Nav arrow button ───────────────────────────────────────────────────────

function NavArrow({ d }: { d: string }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        border: `1px solid ${hovered ? `${theme.brandSoft}` : `${theme.border}`}`,
        background: hovered ? `${theme.brandSoft}` : "white",
        color: hovered ? `${theme.brandPrimary}` : `${theme.slateColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all .15s",
        flexShrink: 0,
      }}>
      <SvgIcon d={d} size={14} strokeWidth={2.5} />
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function PagerScheduleAppStoreDashboard({
  children,
  searchText,
  setSearchText,
}: PagerScheduleAppStoreDashboardProps) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const { data: meData } = trpc.viewer.me.get.useQuery({ includePasswordAdded: false });
  const [show2FABanner, setShow2FABanner] = useState(true);
  const shouldShowBanner = show2FABanner && !meData?.twoFactorEnabled;
  const [searchFocused, setSearchFocused] = useState(false);

  const userName = session?.user?.name ?? "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const closeModal = () => {
    setShow2FAModal(false);
    setTwoFAStep(1);
    setVerificationCode("");
  };

  const sectionHeader = (title: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
      }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: `${theme.inkColor}` }}>{title}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <NavArrow d="M15 18l-6-6 6-6" />
        <NavArrow d={ICONS.chevronRight} />
      </div>
    </div>
  );

  return (
    <>
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
          <div style={{ padding: "22px 20px 18px" }}>
            <WaveformLogo size={34} />
          </div>
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

          {/* Nav */}
          <nav style={{ padding: "0 10px", flex: 1 }}>
            {[
              { label: "Event Types", href: "/event-types", icon: ICONS.calendar },
              { label: "Bookings", href: "/bookings/upcoming", icon: ICONS.bookings },
              { label: "Availability", href: "/availability", icon: ICONS.clock },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: "transparent",
                  color: `${theme.slateColor}`,
                  fontSize: 13.5,
                  fontWeight: 400,
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "all .15s",
                }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <SvgIcon d={item.icon} size={15} />
                </div>
                {item.label}
              </Link>
            ))}

            {/* Apps — active, expanded */}
            <div
              style={{
                borderRadius: 10,
                background: `${theme.brandSoft}`,
                marginBottom: 2,
                overflow: "hidden",
              }}>
              <Link
                href="/apps"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  color: `${theme.brandPrimary}`,
                  fontSize: 13.5,
                  fontWeight: 600,
                  textDecoration: "none",
                }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: `${alpha(theme.brandPrimary, 0.12)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <SvgIcon d={ICONS.grid} size={15} />
                </div>
                <span style={{ flex: 1 }}>Apps</span>
                <SvgIcon d={ICONS.chevronDown} size={12} />
              </Link>

              {/* Sub-items */}
              <div style={{ paddingBottom: 6 }}>
                {[
                  { label: "App store", href: "/apps", active: true },
                  { label: "Installed apps", href: "/apps/installed/calendar", active: false },
                ].map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "7px 12px 7px 52px",
                      color: sub.active ? `${theme.brandPrimary}` : "#6b7280",
                      fontSize: 13,
                      fontWeight: sub.active ? 600 : 400,
                      textDecoration: "none",
                      background: sub.active ? `${alpha(theme.brandPrimary, 0.08)}` : "transparent",
                      borderRadius: 8,
                      margin: "0 4px",
                      transition: "all .15s",
                    }}>
                    {sub.active && (
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: `${theme.brandPrimary}`,
                          display: "inline-block",
                          marginRight: 8,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom */}
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
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
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
              gap: 14,
              flexShrink: 0,
            }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: `${theme.mutedColor}` }}>Apps</span>
              <span style={{ fontSize: 13, color: "#d1d5db", margin: "0 7px" }}>›</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: `${theme.slateColor}` }}>App store</span>
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: 220 }}>
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: `${theme.mutedColor}`,
                  pointerEvents: "none",
                }}>
                <SvgIcon d={ICONS.search} size={14} />
              </div>
              <input
                type="search"
                placeholder="Search apps…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  border: `1.5px solid ${searchFocused ? `${theme.brandPrimary}` : `${theme.border}`}`,
                  borderRadius: 9,
                  background: `${theme.pageBg}`,
                  fontSize: 13,
                  outline: "none",
                  boxShadow: searchFocused ? `0 0 0 3px ${alpha(theme.brandPrimary, 0.12)}` : "none",
                  transition: "all .2s",
                  fontFamily: FONT,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ width: 1, height: 24, background: `${theme.border}`, flexShrink: 0 }} />
            <WaveformLogo size={26} />
          </div>

          {/* 2FA BANNER */}
          {shouldShowBanner && (
            <div
              style={{
                background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
                borderBottom: "1px solid #fed7aa",
                padding: "10px 30px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
              <span style={{ flexShrink: 0, color: "#9a3412" }}>
                <SvgIcon d={ICONS.warning} size={18} strokeWidth={1.8} />
              </span>
              <div style={{ flex: 1, fontSize: 13.5, color: "#9a3412", lineHeight: 1.5 }}>
                <strong>Action required:</strong> You are admin but you do not have 2FA enabled yet.
              </div>
              <button
                onClick={() => setShow2FAModal(true)}
                type="button"
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  background: "#ea580c",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}>
                Enable two-factor authentication
              </button>
              <button
                onClick={() => setShow2FABanner(false)}
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9a3412",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: "0 4px",
                  opacity: 0.6,
                  flexShrink: 0,
                }}>
                ×
              </button>
            </div>
          )}

          {/* CONTENT */}
          <main style={{ flex: 1, background: `${theme.pageBg}`, overflowY: "auto", padding: "30px" }}>
            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: `${theme.inkColor}`,
                  letterSpacing: "-0.4px",
                  margin: "0 0 6px",
                  fontFamily: FONT,
                }}>
                App store
              </h1>
              <p style={{ fontSize: 14, color: `${theme.mutedColor}`, margin: 0, lineHeight: 1.5 }}>
                Connecting people, technology and the workplace
              </p>
            </div>

            {searchText ? (
              /* Search results */
              <div>
                <p
                  style={{
                    fontSize: 13.5,
                    color: `${theme.slateColor}`,
                    marginBottom: 16,
                    fontWeight: 500,
                  }}>
                  Search results for &ldquo;{searchText}&rdquo;
                </p>
                {children}
              </div>
            ) : (
              <>
                {/* Featured categories */}
                <div style={{ marginBottom: 36 }}>
                  {sectionHeader("Featured categories")}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 12,
                    }}>
                    {getFeaturedCats(theme).map((cat) => (
                      <CategoryCard key={cat.name} cat={cat} />
                    ))}
                  </div>
                </div>

                {/* Most popular */}
                <div style={{ marginBottom: 36 }}>
                  {sectionHeader("Most popular")}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 16,
                    }}>
                    {POPULAR_APPS.map((app) => (
                      <PopularAppCard key={app.name} app={app} />
                    ))}
                  </div>
                </div>

                {/* Recently added */}
                <div style={{ marginBottom: 36 }}>
                  {sectionHeader("Recently added")}
                  <div
                    style={{
                      background: theme.cardBg,
                      borderRadius: 16,
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      padding: "48px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `${theme.brandSoft}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: `${theme.brandPrimary}`,
                      }}>
                      <SvgIcon d={ICONS.star} size={22} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: 14, color: `${theme.mutedColor}` }}>
                      New integrations appear here
                    </span>
                  </div>
                </div>

                {/* All apps — real functional component */}
                {children}
              </>
            )}
          </main>
        </div>
      </div>

      {/* 2FA MODAL */}
      {show2FAModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
          }}>
          <div
            style={{
              background: theme.cardBg,
              borderRadius: 16,
              padding: 32,
              width: 420,
              maxWidth: "90vw",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}>
            <button
              onClick={closeModal}
              type="button"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: `${theme.mutedColor}`,
                lineHeight: 1,
                padding: 4,
              }}>
              ✕
            </button>
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    background: s <= twoFAStep ? `${theme.brandPrimary}` : `${theme.border}`,
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>
            {twoFAStep === 1 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: `${theme.inkColor}`, marginBottom: 8 }}>
                  Set up Two-Factor Authentication
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
                  Add an extra layer of security. You&apos;ll need an authenticator app like Google
                  Authenticator or Authy.
                </div>
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 24,
                    border: `1px solid ${theme.border}`,
                  }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Step 1: Install an authenticator app
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    Download Google Authenticator, Authy, or any TOTP-compatible app.
                  </div>
                </div>
                <button
                  onClick={() => setTwoFAStep(2)}
                  type="button"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${theme.brandPrimary}, ${theme.brandPrimary}cc)`,
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}>
                  Continue →
                </button>
              </div>
            )}
            {twoFAStep === 2 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: `${theme.inkColor}`, marginBottom: 8 }}>
                  Scan QR Code
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>
                  Open your authenticator app and scan this QR code.
                </div>
                <div
                  style={{
                    width: 160,
                    height: 160,
                    margin: "0 auto 16px",
                    background: "#f3f4f6",
                    borderRadius: 10,
                    border: `2px solid ${theme.border}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}>
                  <span style={{ fontSize: 36 }}>📱</span>
                  <span style={{ fontSize: 11, color: `${theme.mutedColor}` }}>QR Code</span>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
                  Can&apos;t scan? Enter this key manually:
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#374151",
                      fontWeight: 600,
                      marginTop: 4,
                      letterSpacing: 1,
                    }}>
                    ABCD EFGH IJKL MNOP
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setTwoFAStep(1)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: 11,
                      borderRadius: 8,
                      background: "#f3f4f6",
                      color: "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}>
                    ← Back
                  </button>
                  <button
                    onClick={() => setTwoFAStep(3)}
                    type="button"
                    style={{
                      flex: 2,
                      padding: 11,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${theme.brandPrimary}, ${theme.brandPrimary}cc)`,
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}>
                    I&apos;ve scanned it →
                  </button>
                </div>
              </div>
            )}
            {twoFAStep === 3 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: `${theme.inkColor}`, marginBottom: 8 }}>
                  Verify Setup
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
                  Enter the 6-digit code shown in your authenticator app.
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{
                    width: "100%",
                    padding: 14,
                    textAlign: "center",
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: 10,
                    border: `2px solid ${verificationCode.length === 6 ? `${theme.brandPrimary}` : `${theme.border}`}`,
                    borderRadius: 10,
                    outline: "none",
                    marginBottom: 20,
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                    transition: "border-color 0.2s",
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setTwoFAStep(2)}
                    type="button"
                    style={{
                      flex: 1,
                      padding: 11,
                      borderRadius: 8,
                      background: "#f3f4f6",
                      color: "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}>
                    ← Back
                  </button>
                  <button
                    onClick={() => verificationCode.length === 6 && closeModal()}
                    type="button"
                    style={{
                      flex: 2,
                      padding: 11,
                      borderRadius: 8,
                      background:
                        verificationCode.length === 6
                          ? `linear-gradient(135deg, ${theme.brandPrimary}, ${theme.brandPrimary}cc)`
                          : `${theme.border}`,
                      color: verificationCode.length === 6 ? "white" : `${theme.mutedColor}`,
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: verificationCode.length === 6 ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}>
                    Verify &amp; Enable ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Sub-components (defined after main to avoid hoisting issues) ───────────

function CategoryCard({ cat }: { cat: FeaturedCat }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={cat.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        background: theme.cardBg,
        borderRadius: 16,
        padding: "20px 18px",
        border: `1px solid ${hovered ? `${theme.brandSoft}` : `${theme.border}`}`,
        boxShadow: hovered
          ? `0 8px 24px ${alpha(theme.brandPrimary, 0.1)}`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all .2s",
        textDecoration: "none",
      }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: cat.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: cat.color,
          marginBottom: 12,
        }}>
        <SvgIcon d={cat.icon} size={20} strokeWidth={1.8} />
      </div>
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 700,
          color: `${theme.inkColor}`,
          marginBottom: 5,
          fontFamily: "'DM Sans', -apple-system, sans-serif",
        }}>
        {cat.name}
      </div>
      <div style={{ fontSize: 13, color: `${theme.brandPrimary}`, fontWeight: 500 }}>
        {cat.count} apps →
      </div>
    </Link>
  );
}

function PopularAppCard({ app }: { app: (typeof POPULAR_APPS)[number] }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.cardBg,
        borderRadius: 18,
        border: `1px solid ${hovered ? `${theme.brandSoft}` : `${theme.border}`}`,
        overflow: "hidden",
        boxShadow: hovered
          ? `0 10px 28px ${alpha(theme.brandPrimary, 0.1)}`
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all .2s",
        display: "flex",
        flexDirection: "column",
      }}>
      {/* Header zone */}
      <div
        style={{
          padding: "22px 22px 18px",
          background: `linear-gradient(135deg, ${theme.pageBg}, #eef2ff)`,
          borderBottom: `1px solid ${theme.border}`,
        }}>
        <AppLogo logo={app.logo} size={52} />
      </div>
      {/* Body zone */}
      <div style={{ padding: "18px 22px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            color: `${theme.inkColor}`,
            marginBottom: 8,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
          }}>
          {app.name}
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: `${theme.mutedColor}`,
            lineHeight: 1.6,
            marginBottom: 18,
            minHeight: 52,
            flex: 1,
          }}>
          {app.desc}
        </div>
        <Link
          href={app.href}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            display: "block",
            padding: "10px 0",
            border: `1.5px solid ${btnHovered ? `${theme.brandSoft}` : `${theme.border}`}`,
            borderRadius: 10,
            background: btnHovered ? `${theme.brandSoft}` : "white",
            fontSize: 14,
            fontWeight: 600,
            color: btnHovered ? `${theme.brandPrimary}` : `${theme.slateColor}`,
            textAlign: "center",
            textDecoration: "none",
            transition: "all .15s",
          }}>
          Details
        </Link>
      </div>
    </div>
  );
}
