"use client";

import { useTheme } from "@lib/theme-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

interface PagerScheduleInstalledAppsDashboardProps {
  children: ReactNode;
  activeCategory: string;
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
  chevronRight: "M9 18l6-6-6-6",
  externalLink: "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  // Category icons
  analytics:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  automation: "M13 10V3L4 14h7v7l9-11h-7z",
  conferencing:
    "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  crm: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  messaging: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  payment:
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  other: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z",
};

const CATEGORY_ITEMS = [
  { label: "Analytics", slug: "analytics", icon: ICONS.analytics },
  { label: "AI & Automation", slug: "automation", icon: ICONS.automation },
  { label: "Calendar", slug: "calendar", icon: ICONS.calendar },
  { label: "Conferencing", slug: "conferencing", icon: ICONS.conferencing },
  { label: "CRM", slug: "crm", icon: ICONS.crm },
  { label: "Messaging", slug: "messaging", icon: ICONS.messaging },
  { label: "Payment", slug: "payment", icon: ICONS.payment },
  { label: "Other", slug: "other", icon: ICONS.other },
];

const CATEGORY_META: Record<
  string,
  { title: string; description: string; addHref: string; emptyDesc: string }
> = {
  analytics: {
    title: "Analytics",
    description: "Track and analyse your scheduling data.",
    addHref: "/apps/categories/analytics",
    emptyDesc: "Connect an analytics app to track and optimise your scheduling performance.",
  },
  automation: {
    title: "AI & Automation",
    description: "Automate workflows and save time.",
    addHref: "/apps/categories/automation",
    emptyDesc: "Connect an automation app to streamline your booking workflows.",
  },
  calendar: {
    title: "Calendar",
    description: "Sync calendars to prevent double bookings.",
    addHref: "/apps/categories/calendar",
    emptyDesc: "Add a calendar app to check for conflicts and prevent double bookings.",
  },
  conferencing: {
    title: "Conferencing",
    description: "Auto-generate meeting links for your events.",
    addHref: "/apps/categories/conferencing",
    emptyDesc: "Connect a conferencing app to auto-generate meeting links.",
  },
  crm: {
    title: "CRM",
    description: "Manage your contacts and booking data.",
    addHref: "/apps/categories/crm",
    emptyDesc: "Connect a CRM to manage your contacts and booking data.",
  },
  messaging: {
    title: "Messaging",
    description: "Send reminders and follow-ups automatically.",
    addHref: "/apps/categories/messaging",
    emptyDesc: "Connect a messaging app to send reminders and follow-ups automatically.",
  },
  payment: {
    title: "Payment",
    description: "Collect payments at the time of booking.",
    addHref: "/apps/categories/payment",
    emptyDesc: "Connect a payment app to collect payments when bookings are confirmed.",
  },
  other: {
    title: "Other",
    description: "Extend Pager Schedule with more integrations.",
    addHref: "/apps",
    emptyDesc: "Connect an app to get started.",
  },
};

const FONT = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export function PagerScheduleInstalledAppsDashboard({
  children,
  activeCategory,
}: PagerScheduleInstalledAppsDashboardProps) {
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

  const meta = CATEGORY_META[activeCategory] ?? CATEGORY_META.other;

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
        className="ps-sidebar"
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
            <div style={{ paddingBottom: 6 }}>
              {[
                { label: "App store", href: "/apps", active: false },
                { label: "Installed apps", href: "/apps/installed/calendar", active: true },
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
      <div className="ps-main-area" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
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
            flexShrink: 0,
          }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: `${theme.mutedColor}` }}>Apps</span>
            <span style={{ fontSize: 13, color: "#d1d5db", margin: "0 7px" }}>›</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: `${theme.slateColor}` }}>Installed apps</span>
          </div>
          <WaveformLogo size={26} />
        </div>

        {/* BODY — left category panel + right content */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Left category panel */}
          <div
            style={{
              width: 220,
              background: theme.cardBg,
              borderRight: `1px solid ${theme.border}`,
              padding: "20px 12px",
              flexShrink: 0,
              overflowY: "auto",
            }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: `${theme.mutedColor}`,
                textTransform: "uppercase",
                letterSpacing: 1,
                padding: "0 12px",
                marginBottom: 10,
              }}>
              Categories
            </div>
            {CATEGORY_ITEMS.map((cat) => {
              const isActive = cat.slug === activeCategory;
              return (
                <Link
                  key={cat.slug}
                  href={`/apps/installed/${cat.slug}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: isActive ? `${theme.brandSoft}` : "transparent",
                    color: isActive ? `${theme.brandPrimary}` : `${theme.slateColor}`,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: "none",
                    marginBottom: 2,
                    transition: "all .15s",
                  }}>
                  <SvgIcon d={cat.icon} size={14} />
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  {isActive && <SvgIcon d={ICONS.chevronRight} size={12} />}
                </Link>
              );
            })}
          </div>

          {/* Right content panel */}
          <div
            className="ps-main-scroll"
            style={{
              flex: 1,
              background: `${theme.pageBg}`,
              padding: "28px 30px",
              overflowY: "auto",
              minWidth: 0,
            }}>
            {/* Heading row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 24,
                gap: 16,
              }}>
              <div>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: `${theme.inkColor}`,
                    letterSpacing: "-0.3px",
                    margin: "0 0 4px",
                    fontFamily: FONT,
                  }}>
                  {meta.title}
                </h1>
                <p style={{ fontSize: 13.5, color: `${theme.mutedColor}`, margin: 0, lineHeight: 1.5 }}>
                  {meta.description}
                </p>
              </div>
              <AddButton href={meta.addHref} label={`Add ${meta.title}`} />
            </div>

            {/* Content card */}
            <div
              style={{
                background: theme.cardBg,
                borderRadius: 20,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                overflow: "hidden",
                minHeight: 240,
              }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddButton({ href, label }: { href: string; label: string }) {
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 36,
        padding: "0 18px",
        borderRadius: 10,
        background: `linear-gradient(135deg, ${theme.brandPrimary} 0%, ${theme.brandPrimary}cc 100%)`,
        color: "white",
        fontSize: 13.5,
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: hovered
          ? `0 6px 18px ${alpha(theme.brandPrimary, 0.45)}`
          : `0 2px 10px ${alpha(theme.brandPrimary, 0.35)}`,
        transform: hovered ? "translateY(-1px)" : "none",
        transition: "all .15s",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}>
      {label}
    </Link>
  );
}
