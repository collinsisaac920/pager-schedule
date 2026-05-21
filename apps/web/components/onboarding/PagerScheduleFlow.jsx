"use client";
// ─────────────────────────────────────────────────────────────────────────────
// PagerScheduleFlow.jsx — Part 1 of 4
// Multi-step signup / sign-in flow — Step 0 (Landing) + shared infrastructure
// Parts 2–4 will add steps 1–8 (see TODO comments below).
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  blue:     "#0069ff",
  blueMid:  "#0052cc",
  blueSoft: "#e8f0ff",
  ink:      "#1a1a2e",
  slate:    "#4a5568",
  mist:     "#f0f4ff",
  white:    "#ffffff",
  border:   "#dce4f5",
  success:  "#00c48c",
  red:      "#f56565",
  orange:   "#ed8936",
  green:    "#48bb78",
};

// ─── SHARED BASE STYLES ───────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14.5,
  color: C.ink,
  background: C.white,
  outline: "none",
  transition: "border-color .18s, box-shadow .18s",
  boxSizing: "border-box",
};

const labelSt = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: C.ink,
  marginBottom: 6,
};

const btnBlue = {
  width: "100%",
  padding: "13px 0",
  border: "none",
  borderRadius: 12,
  background: C.blue,
  color: "#fff",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(0,105,255,0.28)",
  transition: "all .2s",
};

// ─── COMPONENT: BrandLogo ─────────────────────────────────────────────────────
// light=true  → white icon box + blue calendar + white wordmark (for blue panel)
// light=false → blue icon box + white calendar + ink wordmark   (for white nav)
function BrandLogo({ size = "md", light = false }) {
  const iconPx  = size === "sm" ? 28 : 36;
  const radius  = size === "sm" ? 8  : 10;
  const wordPx  = size === "sm" ? 16 : 20;
  const iconBg  = light ? C.white : C.blue;
  const stroke  = light ? C.blue  : C.white;
  const wordCol = light ? C.white : C.ink;

  // Calendar SVG: rounded rect body, two ring ticks at top, horizontal divider line
  const s = iconPx * 0.62;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: iconPx, height: iconPx, borderRadius: radius,
        background: iconBg, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={s} height={s} viewBox="0 0 22 22" fill="none">
          {/* Calendar body */}
          <rect x="2" y="4" width="18" height="16" rx="2.5"
            stroke={stroke} strokeWidth="1.8" />
          {/* Ring ticks */}
          <line x1="7"  y1="2" x2="7"  y2="6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="15" y1="2" x2="15" y2="6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          {/* Horizontal divider across upper third */}
          <line x1="2" y1="9" x2="20" y2="9" stroke={stroke} strokeWidth="1.6" />
        </svg>
      </div>
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: wordPx,
        fontWeight: 600,
        color: wordCol,
        letterSpacing: "-0.3px",
        whiteSpace: "nowrap",
      }}>
        PagerSchedule
      </span>
    </div>
  );
}

// ─── COMPONENT: GoogleSvg ─────────────────────────────────────────────────────
function GoogleSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.342 17.64 12.034 17.64 9.2z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── COMPONENT: EyeBtn ───────────────────────────────────────────────────────
function EyeBtn({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 0,
      }}
    >
      {show ? (
        // Eye-slash: password is visible, click to hide
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#9aabcc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        // Eye: password is hidden, click to reveal
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#9aabcc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );
}

// ─── COMPONENT: Divider ──────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: 12.5, color: "#9aabcc", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

// ─── COMPONENT: ContinueBtn ──────────────────────────────────────────────────
function ContinueBtn({ onClick, label = "Continue →", disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      style={{
        ...btnBlue,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        background: hov && !disabled ? C.blueMid : C.blue,
        transform: hov && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hov && !disabled
          ? "0 6px 22px rgba(0,105,255,0.38)"
          : "0 4px 16px rgba(0,105,255,0.28)",
      }}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </button>
  );
}

// ─── COMPONENT: BackBtn ──────────────────────────────────────────────────────
function BackBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: hov ? C.ink : C.slate,
        fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
        display: "flex", alignItems: "center", gap: 6,
        marginTop: 16, padding: 0,
        transition: "color .15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>
  );
}

// ─── COMPONENT: FocusInput ───────────────────────────────────────────────────
// Manages its own focus border/shadow state.
// suffix = inside-input right element (e.g. EyeBtn)
// right  = label-row right element (e.g. Forgot password link)
function FocusInput({ id, label, type = "text", placeholder, value, onChange, suffix, right }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {(label || right) && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 6,
        }}>
          {label && <label htmlFor={id} style={labelSt}>{label}</label>}
          {right && <div>{right}</div>}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderColor: focused ? C.blue : C.border,
            boxShadow: focused ? "0 0 0 3px rgba(0,105,255,0.12)" : "none",
            paddingRight: suffix ? 44 : 14,
          }}
        />
        {suffix && (
          <div style={{
            position: "absolute", right: 12,
            top: "50%", transform: "translateY(-50%)",
          }}>
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENT: LeftPanel ────────────────────────────────────────────────────
// Shown on steps 0–2 (split layout). 46% width, solid blue background.
function LeftPanel() {
  const checkItems = [
    "One link for all your availability",
    "Syncs with Google, Outlook & Apple Calendar",
    "Automated reminders & follow-ups",
    "Free forever — no credit card required",
  ];
  const avatars = ["A", "J", "M", "+"];

  return (
    <div style={{
      width: "46%",
      background: C.blue,
      padding: "48px 52px",
      flexShrink: 0,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: "100vh",
    }}>
      {/* Decorative blurred circles */}
      <div style={{
        position: "absolute",
        width: 480, height: 480, borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        top: -120, left: -100,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: 320, height: 320, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        bottom: -80, right: -60,
        pointerEvents: "none",
      }} />

      {/* TOP — brand logo */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <BrandLogo light={true} />
      </div>

      {/* MIDDLE — headline, body, checklist */}
      <div style={{
        position: "relative", zIndex: 1,
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "40px 0",
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(30px,3vw,44px)",
          fontWeight: 400,
          color: C.white,
          lineHeight: 1.2,
          marginBottom: 18, marginTop: 0,
        }}>
          Scheduling that{" "}
          <em style={{ fontStyle: "italic", color: "rgba(255,255,255,0.72)" }}>
            works for you,
          </em>{" "}
          not against you.
        </h1>

        <p style={{
          fontSize: 15.5,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.65,
          maxWidth: 340,
          margin: 0,
        }}>
          Connect your calendar, share your link, and let people book time
          without the back-and-forth.
        </p>

        {/* Checklist */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 13 }}>
          {checkItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <polyline
                    points="2,7 5,10 11,4"
                    stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.82)" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM — avatar stack + social proof */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex" }}>
          {avatars.map((a, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `2.5px solid ${C.blue}`,
              background: C.blueSoft,
              fontSize: 12, fontWeight: 700,
              color: C.blue,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginLeft: i === 0 ? 0 : -10,
              zIndex: avatars.length - i,
              position: "relative",
            }}>
              {a}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          <strong style={{ color: C.white }}>10M+ professionals</strong>
          {" "}save time every week
        </span>
      </div>
    </div>
  );
}

// ─── HELPER: calcStr ─────────────────────────────────────────────────────────
function calcStr(val) {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

// ─── STEP 0 — LANDING ─────────────────────────────────────────────────────────
function Step0({
  landingTab, setLandingTab,
  email, setEmail,
  siEmail, setSiEmail,
  siPass, setSiPass,
  showSiPw, setShowSiPw,
  onContinue,
}) {
  const [gHov,     setGHov]     = useState(false);
  const [magicHov, setMagicHov] = useState(false);

  const googleBtnSt = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, width: "100%", padding: "12px 0",
    border: `1.5px solid ${gHov ? C.blue : C.border}`,
    borderRadius: 12,
    background: gHov ? C.mist : C.white,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14.5, fontWeight: 500,
    color: C.ink, cursor: "pointer",
    transition: "all .18s",
  };

  const magicBtnSt = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, width: "100%", padding: "12px 0",
    border: `1.5px solid ${magicHov ? C.blue : C.border}`,
    borderRadius: 12,
    background: magicHov ? C.mist : C.white,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14.5, fontWeight: 500,
    color: C.ink, cursor: "pointer",
    transition: "all .18s",
  };

  return (
    <div style={{
      flex: 1, display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "48px 36px",
      background: C.mist,
    }}>
      <div style={{
        background: C.white,
        borderRadius: 20,
        padding: "40px 44px",
        width: "100%", maxWidth: 448,
        boxShadow: "0 4px 40px rgba(0,80,200,0.09)",
      }}>

        {/* ── Tab row ── */}
        <div style={{
          display: "flex",
          background: C.mist,
          borderRadius: 12,
          padding: 4, gap: 4,
          marginBottom: 28,
        }}>
          {[["signup", "Create account"], ["signin", "Sign in"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => setLandingTab(val)}
              style={{
                flex: 1, padding: "9px 0",
                border: "none", borderRadius: 9,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, fontWeight: 500,
                cursor: "pointer", transition: "all .18s",
                background: landingTab === val ? C.white : "transparent",
                color:      landingTab === val ? C.ink  : C.slate,
                boxShadow:  landingTab === val
                  ? "0 1px 6px rgba(0,80,200,0.12)"
                  : "none",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* ── CREATE ACCOUNT TAB ── */}
        {landingTab === "signup" && (
          <>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26, fontWeight: 400,
              color: C.ink, marginBottom: 5, marginTop: 0,
            }}>
              Get started free
            </h2>
            <p style={{ fontSize: 14, color: C.slate, marginBottom: 24, marginTop: 0 }}>
              No credit card required.
            </p>

            <button
              style={googleBtnSt}
              onMouseEnter={() => setGHov(true)}
              onMouseLeave={() => setGHov(false)}
            >
              <GoogleSvg /> Continue with Google
            </button>

            <Divider label="or sign up with email" />

            <FocusInput
              id="su-email"
              label="Work email"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <ContinueBtn
              label="Continue with email →"
              disabled={!email.trim()}
              onClick={() => email.trim() && onContinue()}
            />

            <p style={{ textAlign: "center", fontSize: 13, color: C.slate, marginTop: 20, marginBottom: 0 }}>
              Already have an account?{" "}
              <a
                href="#"
                onClick={e => { e.preventDefault(); setLandingTab("signin"); }}
                style={{ color: C.blue, fontWeight: 500, textDecoration: "none" }}
              >
                Sign in
              </a>
            </p>
          </>
        )}

        {/* ── SIGN IN TAB ── */}
        {landingTab === "signin" && (
          <>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26, fontWeight: 400,
              color: C.ink, marginBottom: 5, marginTop: 0,
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: C.slate, marginBottom: 24, marginTop: 0 }}>
              Sign in to your PagerSchedule account.
            </p>

            <button
              style={googleBtnSt}
              onMouseEnter={() => setGHov(true)}
              onMouseLeave={() => setGHov(false)}
            >
              <GoogleSvg /> Continue with Google
            </button>

            <Divider label="or sign in with email" />

            <FocusInput
              id="si-email"
              label="Email address"
              type="email"
              placeholder="alex@company.com"
              value={siEmail}
              onChange={e => setSiEmail(e.target.value)}
            />

            <FocusInput
              id="si-pass"
              label="Password"
              type={showSiPw ? "text" : "password"}
              placeholder="••••••••"
              value={siPass}
              onChange={e => setSiPass(e.target.value)}
              suffix={
                <EyeBtn show={showSiPw} onToggle={() => setShowSiPw(v => !v)} />
              }
              right={
                <a
                  href="#"
                  onClick={e => e.preventDefault()}
                  style={{ fontSize: 13, color: C.blue, textDecoration: "none" }}
                >
                  Forgot password?
                </a>
              }
            />

            <ContinueBtn
              label="Sign in →"
              disabled={!siEmail.trim() || !siPass}
              onClick={() => {}}
            />

            <Divider label="or" />

            <button
              style={magicBtnSt}
              onMouseEnter={() => setMagicHov(true)}
              onMouseLeave={() => setMagicHov(false)}
            >
              {/* Envelope icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={C.blue} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Send me a magic link
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: C.slate, marginTop: 20, marginBottom: 0 }}>
              Don&apos;t have an account?{" "}
              <a
                href="#"
                onClick={e => { e.preventDefault(); setLandingTab("signup"); }}
                style={{ color: C.blue, fontWeight: 500, textDecoration: "none" }}
              >
                Sign up free
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STEP 1 — EMAIL VERIFICATION ─────────────────────────────────────────────
function Step1({ email, setEmail, setStep, next }) {
  const wrapSt = {
    flex: 1, display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: "48px 36px",
    background: C.mist,
  };
  const cardSt = {
    background: C.white,
    borderRadius: 20,
    padding: "40px 44px",
    width: "100%", maxWidth: 448,
    boxShadow: "0 4px 40px rgba(0,80,200,0.09)",
  };

  return (
    <div style={wrapSt}>
      <div style={cardSt}>

        {/* Icon block */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 68, height: 68, borderRadius: "50%",
            background: C.blueSoft,
            margin: "0 auto 18px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
              stroke={C.blue} strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polyline points="2,4 12,13 22,4" />
            </svg>
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 26, fontWeight: 400,
            color: C.ink, margin: 0,
          }}>
            Verify your email
          </h2>
        </div>

        <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.7, marginBottom: 16 }}>
          Before continuing, we need to verify your email address.
          Please check your inbox for a confirmation link.
        </p>

        {/* Email highlight box */}
        <div style={{
          background: C.mist, borderRadius: 10, padding: "11px 14px",
          border: `1px solid ${C.border}`, marginBottom: 18,
          display: "flex", flexDirection: "row", gap: 10, alignItems: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={C.blue} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="2,4 12,13 22,4" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.ink, wordBreak: "break-all" }}>
            {email}
          </span>
        </div>

        <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.7, marginBottom: 6 }}>
          If you do not receive the email at{" "}
          <strong style={{ color: C.ink }}>{email}</strong>
          {" "}within an hour, we can resend it to you.
        </p>

        <button
          type="button"
          onClick={() => {}}
          style={{
            background: "none", border: "none",
            color: C.blue, fontSize: 13.5, fontWeight: 500,
            cursor: "pointer", padding: 0, display: "block",
            marginBottom: 22,
          }}
        >
          Resend confirmation email →
        </button>

        <div style={{ height: 1, background: C.border, marginBottom: 18 }} />

        <p style={{ fontSize: 13.5, color: C.slate, lineHeight: 1.7, marginBottom: 20 }}>
          If you want to sign up with another account, then{" "}
          <a
            href="#"
            onClick={e => { e.preventDefault(); setEmail(""); setStep(0); }}
            style={{ color: C.blue, textDecoration: "none", fontWeight: 500 }}
          >
            click on this link
          </a>.
        </p>

        <ContinueBtn label="I've verified — continue →" onClick={next} />
      </div>
    </div>
  );
}

// ─── STEP 2 — PROFILE SETUP ───────────────────────────────────────────────────
function Step2({ form, setForm, showPw, setShowPw, pwStr, setPwStr, next, back }) {
  const [fnFocus, setFnFocus] = useState(false);
  const [lnFocus, setLnFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const strColors = [C.border, C.red, C.orange, C.green, C.success];
  const strWidths = ["0%", "30%", "55%", "80%", "100%"];
  const strLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const wrapSt = {
    flex: 1, display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: "48px 36px",
    background: C.mist,
  };
  const cardSt = {
    background: C.white,
    borderRadius: 20,
    padding: "40px 44px",
    width: "100%", maxWidth: 448,
    boxShadow: "0 4px 40px rgba(0,80,200,0.09)",
  };

  return (
    <div style={wrapSt}>
      <div style={cardSt}>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 26, fontWeight: 400,
          color: C.ink, marginBottom: 6, marginTop: 0,
        }}>
          Set up your profile
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, marginBottom: 26, marginTop: 0 }}>
          Just a few more details to get started.
        </p>

        {/* Name row */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, marginBottom: 14 }}>
            <label style={labelSt}>First name</label>
            <input
              type="text"
              placeholder="Alex"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              onFocus={() => setFnFocus(true)}
              onBlur={() => setFnFocus(false)}
              style={{
                ...inputStyle,
                borderColor: fnFocus ? C.blue : C.border,
                boxShadow: fnFocus ? "0 0 0 3px rgba(0,105,255,0.12)" : "none",
              }}
            />
          </div>
          <div style={{ flex: 1, marginBottom: 14 }}>
            <label style={labelSt}>Last name</label>
            <input
              type="text"
              placeholder="Rivera"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              onFocus={() => setLnFocus(true)}
              onBlur={() => setLnFocus(false)}
              style={{
                ...inputStyle,
                borderColor: lnFocus ? C.blue : C.border,
                boxShadow: lnFocus ? "0 0 0 3px rgba(0,105,255,0.12)" : "none",
              }}
            />
          </div>
        </div>

        {/* Password field + strength bar */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelSt}>Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={e => {
                setForm(f => ({ ...f, password: e.target.value }));
                setPwStr(calcStr(e.target.value));
              }}
              onFocus={() => setPwFocus(true)}
              onBlur={() => setPwFocus(false)}
              style={{
                ...inputStyle,
                paddingRight: 44,
                borderColor: pwFocus ? C.blue : C.border,
                boxShadow: pwFocus ? "0 0 0 3px rgba(0,105,255,0.12)" : "none",
              }}
            />
            <div style={{
              position: "absolute", right: 12,
              top: "50%", transform: "translateY(-50%)",
            }}>
              <EyeBtn show={showPw} onToggle={() => setShowPw(v => !v)} />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, background: C.border, borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                transition: "width .3s, background .3s",
                width: strWidths[pwStr],
                background: strColors[pwStr],
              }} />
            </div>
            {pwStr > 0 && (
              <div style={{ marginTop: 5, fontSize: 12, color: strColors[pwStr] }}>
                {strLabels[pwStr]}
              </div>
            )}
          </div>
        </div>

        <ContinueBtn
          label="Create account →"
          disabled={!form.firstName || !form.password}
          onClick={next}
        />

        <BackBtn onClick={back} />
      </div>
    </div>
  );
}

// ─── COMPONENT: ProgressBar ──────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const pos = i + 1;
        const active = pos === current;
        const filled = pos < current;
        return (
          <div
            key={i}
            style={{
              height: 6,
              borderRadius: 99,
              transition: "all .3s",
              width: active ? 28 : 8,
              background: (active || filled) ? C.blue : C.border,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── COMPONENT: SelectTile ────────────────────────────────────────────────────
function SelectTile({ emoji, label, selected, onClick, size = "normal" }) {
  const [hovered, setHovered] = useState(false);
  const isLarge = size === "large";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `2px solid ${selected ? C.blue : hovered ? "#b0c4f5" : C.border}`,
        borderRadius: 14,
        background: selected ? C.blueSoft : C.white,
        boxShadow: selected ? "0 0 0 3px rgba(0,105,255,0.1)" : "none",
        transform: hovered && !selected ? "translateY(-1px)" : "none",
        cursor: "pointer",
        outline: "none",
        transition: "all .15s",
        ...(isLarge ? {
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center",
          padding: "28px 16px",
        } : {
          display: "flex", flexDirection: "row",
          alignItems: "flex-start",
          gap: 12, padding: "14px 16px",
        }),
      }}
    >
      <span style={{ fontSize: isLarge ? 28 : 20, lineHeight: 1 }}>{emoji}</span>

      {isLarge ? (
        <span style={{
          fontSize: 14, color: C.ink, marginTop: 10,
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {label}
        </span>
      ) : (
        <>
          <span style={{
            flex: 1, fontSize: 13.5, lineHeight: 1.4,
            fontWeight: selected ? 600 : 500,
            color: selected ? C.blue : C.ink,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "left",
          }}>
            {label}
          </span>
          {selected && (
            <div style={{
              marginLeft: "auto", flexShrink: 0,
              width: 18, height: 18, borderRadius: "50%",
              background: C.blue,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <polyline points="1.5,5.5 3.8,7.5 8.5,2.5"
                  stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </>
      )}
    </button>
  );
}

// ─── COMPONENT: OnboardingNav ─────────────────────────────────────────────────
function OnboardingNav({ onboardingStep, setStep }) {
  return (
    <div style={{
      width: "100%",
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      padding: "18px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <BrandLogo size="sm" light={false} />
      <ProgressBar current={onboardingStep} total={5} />
      <button
        type="button"
        onClick={() => setStep(8)}
        style={{
          fontSize: 13, color: C.slate,
          background: "none", border: "none",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Skip for now
      </button>
    </div>
  );
}

// ─── DATA: Features + Roles ───────────────────────────────────────────────────
const FEATURES_LIST = [
  { id: "emails",   emoji: "🕗",   label: "Automate pre/post meeting emails" },
  { id: "payment",  emoji: "💰",   label: "Collect payment" },
  { id: "multi",    emoji: "🧑‍🤝‍🧑",  label: "Meet with multiple attendees" },
  { id: "sched",    emoji: "🗓️",   label: "Schedule meetings" },
  { id: "contacts", emoji: "📋",   label: "Manage contact records" },
  { id: "record",   emoji: "🎥",   label: "Record and transcribe meetings" },
];

const ROLES_LIST = [
  { id: "finance",    emoji: "💰", label: "Finance" },
  { id: "sales",      emoji: "📈", label: "Sales" },
  { id: "cs",         emoji: "🛟", label: "Customer success" },
  { id: "recruiting", emoji: "📋", label: "Recruiting" },
  { id: "marketing",  emoji: "🚀", label: "Marketing" },
  { id: "education",  emoji: "📚", label: "Education" },
  { id: "consulting", emoji: "💼", label: "Consulting" },
  { id: "other",      emoji: "🦄", label: "Other" },
];

// ─── STEP 3 — USAGE INTENT ────────────────────────────────────────────────────
function Step3({ form, usageIntent, setUsageIntent, next }) {
  return (
    <div style={{
      flex: 1, display: "flex", justifyContent: "center",
      padding: "48px 40px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: C.blue,
          textTransform: "uppercase", letterSpacing: "0.8px",
          marginBottom: 8, marginTop: 0,
        }}>
          Welcome 👋
        </p>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 30, fontWeight: 400,
          color: C.ink, marginBottom: 10, marginTop: 0,
        }}>
          {form.firstName ? `Hi ${form.firstName}! How` : "How"} do you plan on using PagerSchedule?
        </h2>

        <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.6, marginBottom: 32 }}>
          Your responses will help us tailor your experience to your needs.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, marginBottom: 36,
        }}>
          <SelectTile size="large" emoji="☝️" label="On my own"
            selected={usageIntent === "solo"} onClick={() => setUsageIntent("solo")} />
          <SelectTile size="large" emoji="🤝" label="With my team"
            selected={usageIntent === "team"} onClick={() => setUsageIntent("team")} />
        </div>

        <ContinueBtn disabled={!usageIntent} onClick={next} />
      </div>
    </div>
  );
}

// ─── STEP 4 — FEATURES ────────────────────────────────────────────────────────
function Step4({ features, setFeatures, next, back }) {
  const toggle = id =>
    setFeatures(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div style={{
      flex: 1, display: "flex", justifyContent: "center",
      padding: "48px 40px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 30, fontWeight: 400,
          color: C.ink, marginBottom: 8, marginTop: 0,
        }}>
          How can PagerSchedule help you?
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, marginBottom: 28 }}>
          Select all that apply
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginBottom: 28,
        }}>
          {FEATURES_LIST.map(f => (
            <SelectTile key={f.id} size="normal"
              emoji={f.emoji} label={f.label}
              selected={features.includes(f.id)}
              onClick={() => toggle(f.id)} />
          ))}
        </div>

        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.5, marginBottom: 20 }}>
          PagerSchedule will use this and your calendar information to customize your experience.
        </p>

        <ContinueBtn disabled={features.length === 0} onClick={next} />
        <BackBtn onClick={back} />
      </div>
    </div>
  );
}

// ─── STEP 5 — ROLE ────────────────────────────────────────────────────────────
function Step5({ role, setRole, next, back }) {
  return (
    <div style={{
      flex: 1, display: "flex", justifyContent: "center",
      padding: "48px 40px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 30, fontWeight: 400,
          color: C.ink, marginBottom: 8, marginTop: 0,
        }}>
          What is your role?
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.6, marginBottom: 28 }}>
          Understanding your role will help us set up your first scheduling link.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginBottom: 36,
        }}>
          {ROLES_LIST.map(r => (
            <SelectTile key={r.id} size="normal"
              emoji={r.emoji} label={r.label}
              selected={role === r.id}
              onClick={() => setRole(r.id)} />
          ))}
        </div>

        <ContinueBtn disabled={!role} onClick={next} />
        <BackBtn onClick={back} />
      </div>
    </div>
  );
}

// ─── DATA: Calendars + Meetings ──────────────────────────────────────────────
const CALENDARS = [
  { id: "google",   label: "Google Calendar",   sub: "Gmail / Google Workspace" },
  { id: "outlook",  label: "Outlook Calendar",  sub: "Microsoft 365 / Outlook.com" },
  { id: "apple",    label: "Apple Calendar",    sub: "iCloud / macOS / iOS" },
  { id: "exchange", label: "Exchange Calendar", sub: "Microsoft Exchange Server" },
  { id: "yahoo",    label: "Yahoo Calendar",    sub: "Yahoo Mail accounts" },
  { id: "zoho",     label: "Zoho Calendar",     sub: "Zoho Workplace" },
  { id: "fastmail", label: "FastMail",          sub: "FastMail accounts" },
  { id: "proton",   label: "Proton Calendar",   sub: "ProtonMail accounts" },
  { id: "caldav",   label: "CalDAV / iCal URL", sub: "Any CalDAV-compatible calendar" },
];

const MEETINGS = [
  { id: "zoom",     label: "Zoom",            color: "#2D8CFF", initials: "Z", needsConnect: true },
  { id: "meet",     label: "Google Meet",     color: "#00AC47", initials: "M", needsConnect: true },
  { id: "teams",    label: "Microsoft Teams", color: "#5059C9", initials: "T", needsConnect: true },
  { id: "webex",    label: "Cisco Webex",     color: "#00BCEB", initials: "W", needsConnect: true },
  { id: "inperson", label: "In-person",       emoji: "📍",                    needsConnect: false },
  { id: "phone",    label: "Phone call",      emoji: "📞",                    needsConnect: false },
];

// ─── COMPONENT: CalIcon ───────────────────────────────────────────────────────
const CAL_BRANDS = {
  outlook:  { bg: "#0078D4", text: "O"  },
  exchange: { bg: "#107C41", text: "Ex" },
  yahoo:    { bg: "#6001D2", text: "Y!" },
  zoho:     { bg: "#E42527", text: "Z"  },
  fastmail: { bg: "#1A77C9", text: "FM" },
  proton:   { bg: "#6D4AFF", text: "P"  },
  caldav:   { bg: "#718096", text: "⚙"  },
};

function CalIcon({ id }) {
  const base = {
    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  if (id === "google") return (
    <div style={{ ...base, background: C.white, border: `1px solid ${C.border}` }}>
      <svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.342 17.64 12.034 17.64 9.2z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
    </div>
  );

  if (id === "apple") return (
    <div style={{ ...base, background: "#000" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="white"/>
      </svg>
    </div>
  );

  const b = CAL_BRANDS[id] || { bg: C.slate, text: "?" };
  return (
    <div style={{ ...base, background: b.bg }}>
      <span style={{ color: "white", fontSize: 13, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>
        {b.text}
      </span>
    </div>
  );
}

// ─── COMPONENT: CalendarRow ───────────────────────────────────────────────────
function CalendarRow({ cal, connected, onConnect }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "13px 18px", borderRadius: 14, transition: "all .15s",
      border: `1.5px solid ${connected ? C.blue : C.border}`,
      background: connected ? C.blueSoft : C.white,
    }}>
      <CalIcon id={cal.id} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{cal.label}</div>
        <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{cal.sub}</div>
      </div>
      {connected ? (
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.success, fontSize: 13, fontWeight: 600 }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
            stroke={C.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,7.5 5.5,11 13,4" />
          </svg>
          Connected
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            padding: "7px 18px", borderRadius: 8, cursor: "pointer",
            border: `1.5px solid ${hov ? C.blue : C.border}`,
            background: hov ? C.blueSoft : C.white,
            color: hov ? C.blue : C.ink,
            fontSize: 13.5, fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            transition: "all .15s",
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}

// ─── COMPONENT: MeetingTile ───────────────────────────────────────────────────
function MeetingTile({ m, selected, onToggle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 18px", borderRadius: 14,
        cursor: "pointer", transition: "all .15s",
        border: selected
          ? `2px solid ${C.blue}`
          : hovered ? "2px solid #b0c4f5" : `2px solid ${C.border}`,
        background: selected ? C.blueSoft : C.white,
        boxShadow: selected ? "0 0 0 3px rgba(0,105,255,0.08)" : "none",
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: m.emoji ? C.mist : m.color,
      }}>
        {m.emoji
          ? <span style={{ fontSize: 22 }}>{m.emoji}</span>
          : <span style={{ color: "white", fontSize: 15, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>{m.initials}</span>
        }
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{m.label}</div>
        {m.needsConnect && (
          <div style={{ fontSize: 12, marginTop: 2, color: selected ? C.success : C.blue }}>
            {selected ? "✓ Will connect on save" : "Click to select & connect"}
          </div>
        )}
      </div>

      {selected && (
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: C.blue, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <polyline points="1.5,5.5 4,8 9.5,2.5"
              stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ─── STEP 6 — CALENDAR CONNECT ────────────────────────────────────────────────
function Step6({ connectedCals, setConnectedCals, next, back }) {
  const toggleCal = id => setConnectedCals(p =>
    p.includes(id) ? p.filter(x => x !== id) : [...p, id]
  );
  return (
    <div style={{
      flex: 1, display: "flex", justifyContent: "center",
      padding: "48px 40px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 30, fontWeight: 400,
          color: C.ink, marginBottom: 8, marginTop: 0,
        }}>
          Set up your calendar
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.6, marginBottom: 28 }}>
          We'll check your calendar for existing events and automatically add new bookings.
          Connect as many as you use.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {CALENDARS.map(cal => (
            <CalendarRow
              key={cal.id} cal={cal}
              connected={connectedCals.includes(cal.id)}
              onConnect={() => toggleCal(cal.id)}
            />
          ))}
        </div>

        <ContinueBtn
          onClick={next}
          label={connectedCals.length > 0 ? "Continue →" : "Skip for now →"}
        />
        <BackBtn onClick={back} />
      </div>
    </div>
  );
}

// ─── STEP 7 — MEETING LOCATION ────────────────────────────────────────────────
function Step7({ meetingTypes, setMeetingTypes, next, back }) {
  const toggleMeeting = id => setMeetingTypes(p =>
    p.includes(id) ? p.filter(x => x !== id) : [...p, id]
  );
  return (
    <div style={{
      flex: 1, display: "flex", justifyContent: "center",
      padding: "48px 40px", overflowY: "auto",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 30, fontWeight: 400,
          color: C.ink, marginBottom: 8, marginTop: 0,
        }}>
          How would you like to meet?
        </h2>
        <p style={{ fontSize: 14.5, color: C.slate, lineHeight: 1.6, marginBottom: 28 }}>
          Set a meeting location for your first scheduling link. You can always change this later.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {MEETINGS.map(m => (
            <MeetingTile
              key={m.id} m={m}
              selected={meetingTypes.includes(m.id)}
              onToggle={() => toggleMeeting(m.id)}
            />
          ))}
        </div>

        <ContinueBtn
          label="Finish setup →"
          disabled={meetingTypes.length === 0}
          onClick={next}
        />
        <BackBtn onClick={back} />
      </div>
    </div>
  );
}

// ─── STEP 8 — DONE ────────────────────────────────────────────────────────────
function Step8({ form }) {
  const slug = (form.firstName + form.lastName).toLowerCase().replace(/\s+/g, "") || "yourname";
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: C.white, minHeight: "100vh",
    }}>
      <div style={{
        width: "100%", padding: "18px 40px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <BrandLogo size="sm" light={false} />
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "60px 40px",
      }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 24 }}>🎉</div>

        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 36, fontWeight: 400,
          color: C.ink, marginBottom: 14, marginTop: 0,
        }}>
          You're all set!
        </h2>

        <p style={{
          fontSize: 16, color: C.slate, lineHeight: 1.7,
          maxWidth: 380, marginBottom: 32,
        }}>
          Your PagerSchedule account is ready. Share your scheduling link
          and start booking meetings instantly.
        </p>

        <div style={{
          background: C.mist, borderRadius: 12, padding: "14px 20px",
          border: `1px solid ${C.border}`, marginBottom: 32,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 13, color: C.slate }}>Your link:</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>
            pagerschedule.com/{slug}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(`https://pagerschedule.com/${slug}`)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0", lineHeight: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={C.slate} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          style={{ ...btnBlue, width: "auto", padding: "14px 48px", fontSize: 16 }}
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PagerScheduleFlow() {
  // ── Global state ──
  const [step,          setStep]          = useState(0);
  const [landingTab,    setLandingTab]    = useState("signup");
  const [email,         setEmail]         = useState("");
  const [siEmail,       setSiEmail]       = useState("");
  const [siPass,        setSiPass]        = useState("");
  const [showSiPw,      setShowSiPw]      = useState(false);
  const [form,          setForm]          = useState({ firstName: "", lastName: "", password: "" });
  const [showPw,        setShowPw]        = useState(false);
  const [pwStr,         setPwStr]         = useState(0);
  const [usageIntent,   setUsageIntent]   = useState(null);
  const [features,      setFeatures]      = useState([]);
  const [role,          setRole]          = useState(null);
  const [connectedCals, setConnectedCals] = useState([]);
  const [meetingTypes,  setMeetingTypes]  = useState([]);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const skipToEnd = () => setStep(8);

  const isOnboarding  = step >= 3 && step <= 7;
  const showLeftPanel = !isOnboarding && step !== 8;

  return (
    <>
      {/* ── Google Fonts + global reset + custom scrollbar ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${C.mist}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #b0bddb; }
      `}</style>

      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Left blue panel (steps 0–2) ── */}
        {showLeftPanel && <LeftPanel />}

        {/* ── Step 0 — Landing ── */}
        {step === 0 && (
          <Step0
            landingTab={landingTab}    setLandingTab={setLandingTab}
            email={email}              setEmail={setEmail}
            siEmail={siEmail}          setSiEmail={setSiEmail}
            siPass={siPass}            setSiPass={setSiPass}
            showSiPw={showSiPw}        setShowSiPw={setShowSiPw}
            onContinue={next}
          />
        )}

        {/* ── Step 1 — Email Verification ── */}
        {step === 1 && (
          <Step1
            email={email}
            setEmail={setEmail}
            setStep={setStep}
            next={next}
          />
        )}

        {/* ── Step 2 — Profile Setup ── */}
        {step === 2 && (
          <Step2
            form={form}          setForm={setForm}
            showPw={showPw}      setShowPw={setShowPw}
            pwStr={pwStr}        setPwStr={setPwStr}
            next={next}          back={back}
          />
        )}

        {/* ── Steps 3–5 — Onboarding (Usage Intent, Features, Role) ── */}
        {(step === 3 || step === 4 || step === 5) && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.white }}>
            <OnboardingNav onboardingStep={step - 2} setStep={setStep} />
            {step === 3 && (
              <Step3
                form={form}
                usageIntent={usageIntent} setUsageIntent={setUsageIntent}
                next={next}
              />
            )}
            {step === 4 && (
              <Step4
                features={features} setFeatures={setFeatures}
                next={next} back={back}
              />
            )}
            {step === 5 && (
              <Step5
                role={role} setRole={setRole}
                next={next} back={back}
              />
            )}
          </div>
        )}

        {/* ── Steps 6–7 — Onboarding (Calendar Connect, Meeting Location) ── */}
        {(step === 6 || step === 7) && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: C.white }}>
            <OnboardingNav onboardingStep={step - 2} setStep={setStep} />
            {step === 6 && (
              <Step6
                connectedCals={connectedCals} setConnectedCals={setConnectedCals}
                next={next} back={back}
              />
            )}
            {step === 7 && (
              <Step7
                meetingTypes={meetingTypes} setMeetingTypes={setMeetingTypes}
                next={next} back={back}
              />
            )}
          </div>
        )}

        {/* ── Step 8 — Done ── */}
        {step === 8 && <Step8 form={form} />}

      </div>
    </>
  );
}
