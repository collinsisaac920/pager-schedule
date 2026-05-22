"use client";

import type { RouterOutputs } from "@calcom/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

type GetUserEventGroupsResponse = RouterOutputs["viewer"]["eventTypes"]["getUserEventGroups"];

interface PagerScheduleDashboardProps {
  children: ReactNode;
  userEventGroupsData: GetUserEventGroupsResponse;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  hiddenSlot?: ReactNode;
}

function WaveformLogo({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.265),
          background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.round(size * 0.09),
          flexShrink: 0,
          boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
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
            color: "#111827",
            letterSpacing: "-0.3px",
            lineHeight: 1.1,
          }}>
          Pager
        </div>
        <div
          style={{
            fontSize: Math.round(size * 0.235),
            fontWeight: 700,
            color: "#6366f1",
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
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = userName.charAt(0).toUpperCase();
  const firstProfileSlug = userEventGroupsData?.profiles?.[0]?.slug ?? "";

  const closeModal = () => {
    setShow2FAModal(false);
    setTwoFAStep(1);
    setVerificationCode("");
  };

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
            background: "#ffffff",
            borderRight: "1px solid #e5e7eb",
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
              border: "1px solid #e5e7eb",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #818cf8, #6366f1)",
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
                    color: "#111827",
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
                color: "#9ca3af",
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
                color: "#9ca3af",
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
              background: "white",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              gap: 12,
              flexShrink: 0,
            }}>
            {/* Breadcrumb */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12.5, color: "#9ca3af" }}>Dashboard</span>
              <span style={{ fontSize: 12.5, color: "#d1d5db", margin: "0 6px" }}>/</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Event Types</span>
            </div>

            {/* Search input */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
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
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  background: "#f9fafb",
                  color: "#111827",
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
                background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 4px rgba(99,102,241,0.3)",
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
            style={{ flex: 1, background: "#fce8e8", overflowY: "auto", padding: "24px", position: "relative" }}>
            {/* 2FA warning banner */}
            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                gap: 12,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                    Two-factor authentication is not enabled
                  </div>
                  <div style={{ fontSize: 12, color: "#b45309" }}>
                    Secure your account to prevent unauthorized access.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShow2FAModal(true)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 7,
                  background: "#f97316",
                  color: "white",
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}>
                Setup Now
              </button>
            </div>

            {/* Stat cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}>
              {[
                { label: "Total Event Types", value: "—", sub: "All event types", dot: "#6366f1" },
                { label: "Active", value: "—", sub: "Visible on profile", dot: "#10b981" },
                { label: "Hidden", value: "—", sub: "Hidden from profile", dot: "#f59e0b" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: "18px 20px",
                    border: "1px solid #e5e7eb",
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
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Event type list — existing functional component, visually wrapped */}
            <div
              style={{
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
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

      {/* ── 2FA SETUP MODAL ── */}
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
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}>
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              width: 420,
              maxWidth: "90vw",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}>
            {/* Close */}
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
                color: "#9ca3af",
                lineHeight: 1,
                padding: 4,
              }}>
              ✕
            </button>

            {/* Step progress bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    background: s <= twoFAStep ? "#6366f1" : "#e5e7eb",
                    transition: "background 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Step 1 — Introduction */}
            {twoFAStep === 1 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                  Set up Two-Factor Authentication
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
                  Add an extra layer of security to your account. You&apos;ll need an authenticator app like
                  Google Authenticator or Authy.
                </div>
                <div
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 24,
                    border: "1px solid #e5e7eb",
                  }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                    Step 1: Install an authenticator app
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    Download Google Authenticator, Authy, or any TOTP-compatible app on your mobile device.
                  </div>
                </div>
                <button
                  onClick={() => setTwoFAStep(2)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #818cf8, #6366f1)",
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

            {/* Step 2 — QR Code */}
            {twoFAStep === 2 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
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
                    border: "2px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}>
                  <span style={{ fontSize: 36 }}>📱</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>QR Code</span>
                </div>
                <div
                  style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
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
                    style={{
                      flex: 2,
                      padding: 11,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #818cf8, #6366f1)",
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

            {/* Step 3 — Verify code */}
            {twoFAStep === 3 && (
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                  Verify Setup
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
                  Enter the 6-digit code shown in your authenticator app to confirm setup.
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
                    border: `2px solid ${verificationCode.length === 6 ? "#6366f1" : "#e5e7eb"}`,
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
                    style={{
                      flex: 2,
                      padding: 11,
                      borderRadius: 8,
                      background:
                        verificationCode.length === 6
                          ? "linear-gradient(135deg, #818cf8, #6366f1)"
                          : "#e5e7eb",
                      color: verificationCode.length === 6 ? "white" : "#9ca3af",
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
