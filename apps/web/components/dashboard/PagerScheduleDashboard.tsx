"use client";

import type { RouterOutputs } from "@calcom/trpc/react";
import { useTheme } from "@lib/theme-context";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";

type GetUserEventGroupsResponse = RouterOutputs["viewer"]["eventTypes"]["getUserEventGroups"];

interface PagerScheduleDashboardProps {
  children: ReactNode;
  userEventGroupsData: GetUserEventGroupsResponse;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  hiddenSlot?: ReactNode;
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
          background: `linear-gradient(135deg, ${theme.brandPrimary}cc 0%, ${theme.brandPrimary} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.round(size * 0.09),
          flexShrink: 0,
          boxShadow: `0 2px 8px ${alpha(theme.brandPrimary, 0.3)}`,
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
            fontSize: Math.round(size * 0.41),
            fontWeight: 700,
            color: `${theme.inkColor}`,
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
          }}>
          Pager
        </div>
        <div
          style={{
            fontSize: Math.round(size * 0.235),
            fontWeight: 700,
            color: `${theme.brandPrimary}`,
            letterSpacing: Math.round(size * 0.053),
            lineHeight: 1,
          }}>
          SCHEDULE
        </div>
      </div>
    </div>
  );
}

function SvgIcon({ d, size = 16 }: { d: string; size?: number }) {
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  bookings:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
};

const NAV_ITEMS = [
  { label: "Event Types", href: "/event-types", icon: ICONS.calendar, active: true },
  { label: "Bookings", href: "/bookings", icon: ICONS.bookings, active: false },
  { label: "Availability", href: "/availability", icon: ICONS.clock, active: false },
  { label: "Settings", href: "/settings/my-account/general", icon: ICONS.settings, active: false },
];

export function PagerScheduleDashboard({
  children,
  userEventGroupsData,
  searchTerm,
  setSearchTerm,
  hiddenSlot,
}: PagerScheduleDashboardProps) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const alpha = (hex: string, pct: number): string =>
    hex + Math.round(pct * 255).toString(16).padStart(2, "0");

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = userName.charAt(0).toUpperCase();
  const firstProfileSlug = userEventGroupsData?.profiles?.[0]?.slug ?? "";

  return (
    <>
      {/* Full-screen premium overlay — sits above the Cal shell (z-30) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 30,
          display: "flex",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#f3f4f6",
          overflow: "hidden",
        }}>
        {/* ── SIDEBAR ── */}
        <aside
          style={{
            width: 224,
            background: theme.sidebarBg,
            borderRight: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
          }}>
          {/* Logo */}
          <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #f3f4f6" }}>
            <WaveformLogo size={34} />
          </div>

          {/* User pill */}
          <div
            style={{
              margin: "12px",
              padding: "10px 12px",
              background: "#f9fafb",
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.brandPrimary}cc, ${theme.brandPrimary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{userInitial}</span>
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
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ padding: "6px 12px", flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: item.active ? "#eef2ff" : "transparent",
                  color: item.active ? "#4338ca" : "#6b7280",
                  fontSize: 13,
                  fontWeight: item.active ? 600 : 500,
                  marginBottom: 2,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}>
                <SvgIcon d={item.icon} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Bottom links */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6" }}>
            <Link
              href="/support"
              style={{
                display: "block",
                fontSize: 12,
                color: `${theme.mutedColor}`,
                marginBottom: 6,
                textDecoration: "none",
              }}>
              Help &amp; Support
            </Link>
            <Link
              href="/privacy"
              style={{
                display: "block",
                fontSize: 12,
                color: `${theme.mutedColor}`,
                marginBottom: 8,
                textDecoration: "none",
              }}>
              Privacy
            </Link>
            <div style={{ fontSize: 11, color: "#d1d5db" }}>v2.0.0</div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* TOP BAR */}
          <div
            style={{
              height: 56,
              background: theme.cardBg,
              borderBottom: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 12,
              flexShrink: 0,
            }}>
            {/* Breadcrumb */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12.5, color: `${theme.mutedColor}` }}>Dashboard</span>
              <span style={{ fontSize: 12.5, color: "#d1d5db", margin: "0 6px" }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: `${theme.inkColor}` }}>Event Types</span>
            </div>

            {/* Search input */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: `${theme.mutedColor}`,
                  pointerEvents: "none",
                  display: "flex",
                }}>
                <SvgIcon d={ICONS.search} size={14} />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: 200,
                  padding: "7px 12px 7px 30px",
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#f9fafb",
                  color: `${theme.inkColor}`,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* New event type button */}
            <Link
              href={`?dialog=new&eventPage=${firstProfileSlug}`}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.brandPrimary}cc 0%, ${theme.brandPrimary} 100%)`,
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: `0 1px 4px ${alpha(theme.brandPrimary, 0.3)}`,
                flexShrink: 0,
              }}>
              <span style={{ fontSize: 16, lineHeight: 1, marginTop: -1 }}>+</span>
              New
            </Link>

            {/* Logo mark */}
            <div style={{ marginLeft: 4, opacity: 0.45, flexShrink: 0 }}>
              <WaveformLogo size={26} />
            </div>
          </div>

          {/* CONTENT AREA */}
          <main
            style={{ flex: 1, background: `${theme.pageBg}`, overflowY: "auto", padding: "24px", position: "relative" }}>
            {/* Stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}>
              {[
                { label: "Total Event Types", value: "—", sub: "All event types", dot: `${theme.brandPrimary}` },
                { label: "Active", value: "—", sub: "Visible on profile", dot: "#10b981" },
                { label: "Hidden", value: "—", sub: "Hidden from profile", dot: "#f59e0b" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: theme.cardBg,
                    borderRadius: 12,
                    padding: "18px 20px",
                    border: `1px solid ${theme.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: stat.dot,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontSize: 11.5, color: "#6b7280", fontWeight: 500 }}>{stat.label}</div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: `${theme.inkColor}`, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: `${theme.mutedColor}`, marginTop: 4 }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Event type list — existing functional component, visually wrapped */}
            <div
              style={{
                background: theme.cardBg,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
              {children}
            </div>

            {/* Hidden slot keeps CreateEventTypeDialog mounted so ?dialog=new works */}
            <div
              style={{
                visibility: "hidden",
                height: 0,
                overflow: "hidden",
                position: "absolute",
                top: 0,
                left: 0,
              }}>
              {hiddenSlot}
            </div>
          </main>
        </div>
      </div>

    </>
  );
}
