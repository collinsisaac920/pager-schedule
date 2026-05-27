"use client";

import { useEffect, useRef, useState } from "react";

// ─── Logo ────────────────────────────────────────────────────────────────────
function Logo({ size = 36 }: { size?: number }) {
  return (
    <a href="/" className="lp-logo-wrap" aria-label="PagerSchedule home">
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="lp-logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#lp-logo-grad)" />
        {/* Waveform bars */}
        <rect x="7" y="15" width="3" height="6" rx="1.5" fill="white" opacity="0.9" />
        <rect x="12" y="10" width="3" height="16" rx="1.5" fill="white" />
        <rect x="17" y="13" width="3" height="10" rx="1.5" fill="white" opacity="0.9" />
        <rect x="22" y="7" width="3" height="22" rx="1.5" fill="white" />
        <rect x="27" y="12" width="3" height="12" rx="1.5" fill="white" opacity="0.8" />
      </svg>
      <span className="lp-logo-text">
        <span className="lp-logo-pager">Pager</span>
        <span className="lp-logo-schedule">SCHEDULE</span>
      </span>
    </a>
  );
}

// ─── Sparkle ─────────────────────────────────────────────────────────────────
function Sparkle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={style} aria-hidden="true">
      <path
        d="M8 1 C8 1 8.5 5.5 12 6 C8.5 6.5 8 11 8 11 C8 11 7.5 6.5 4 6 C7.5 5.5 8 1 8 1Z"
        fill="#6366f1"
      />
    </svg>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Floating Calendar Card ───────────────────────────────────────────────────
function FloatingCalendar() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const dates = [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ];
  const busy = [8, 9, 14, 22, 23];
  const selected = 15;

  return (
    <div className="lp-cal-card">
      <div className="lp-cal-header">
        <span className="lp-cal-month">June 2026</span>
        <div className="lp-cal-nav">
          <button aria-label="Previous month">‹</button>
          <button aria-label="Next month">›</button>
        </div>
      </div>
      <div className="lp-cal-grid">
        {days.map((d) => (
          <div key={d} className="lp-cal-dayname">
            {d}
          </div>
        ))}
        {dates.map((week, wi) =>
          week.map((date, di) => (
            <div
              key={`${wi}-${di}`}
              className={[
                "lp-cal-date",
                date === null ? "lp-cal-empty" : "",
                date === selected ? "lp-cal-selected" : "",
                date && busy.includes(date) ? "lp-cal-busy" : "",
              ]
                .filter(Boolean)
                .join(" ")}>
              {date}
            </div>
          ))
        )}
      </div>
      <div className="lp-cal-slots">
        <p className="lp-cal-slots-title">Available on Jun 15</p>
        {["9:00 AM", "10:30 AM", "2:00 PM"].map((t) => (
          <div key={t} className="lp-cal-slot">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pricing Toggle ───────────────────────────────────────────────────────────
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      price: 0,
      annualPrice: 0,
      desc: "For individuals getting started",
      features: [
        "1 event type",
        "Unlimited bookings",
        "Google & Outlook sync",
        "Public booking page",
        "Email notifications",
      ],
      cta: "Get started free",
      ctaHref: "/auth/signup",
      highlight: false,
      badge: null,
    },
    {
      name: "Pro",
      price: 12,
      annualPrice: 9,
      desc: "For professionals who need more",
      features: [
        "Unlimited event types",
        "Custom availability rules",
        "SMS reminders",
        "Payment collection",
        "Analytics dashboard",
        "Priority support",
      ],
      cta: "Start free trial",
      ctaHref: "/auth/signup",
      highlight: true,
      badge: "Most Popular",
    },
    {
      name: "Team",
      price: 20,
      annualPrice: 16,
      desc: "Per user/month — for growing teams",
      features: [
        "Everything in Pro",
        "Round-robin routing",
        "Collective scheduling",
        "Team analytics",
        "Admin controls",
        "8-hour support SLA",
      ],
      cta: "Start free trial",
      ctaHref: "/auth/signup",
      highlight: false,
      badge: null,
    },
    {
      name: "Enterprise",
      price: null,
      annualPrice: null,
      desc: "For large organisations",
      features: [
        "Everything in Team",
        "SSO / SAML",
        "Custom SLA (99.99%)",
        "Dedicated CSM",
        "Custom integrations",
        "1-hour support SLA",
        "DPA & security review",
      ],
      cta: "Contact sales",
      ctaHref: "mailto:sales@pagerschedule.com",
      highlight: false,
      badge: null,
    },
  ];

  return (
    <section className="lp-section" id="pricing">
      <div className="lp-section-inner">
        <div className="lp-section-label">Pricing</div>
        <h2 className="lp-section-title">Simple, transparent pricing</h2>
        <p className="lp-section-sub">Start free. Upgrade when you need it. No hidden fees.</p>

        <div className="lp-pricing-toggle">
          <span className={!annual ? "lp-toggle-active" : ""}>Monthly</span>
          <button
            className={`lp-toggle-btn ${annual ? "lp-toggle-on" : ""}`}
            onClick={() => setAnnual(!annual)}
            aria-label="Toggle annual billing">
            <span className="lp-toggle-knob" />
          </button>
          <span className={annual ? "lp-toggle-active" : ""}>
            Annual <span className="lp-toggle-save">Save 25%</span>
          </span>
        </div>

        <div className="lp-pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`lp-pricing-card ${plan.highlight ? "lp-pricing-highlight" : ""}`}>
              {plan.badge && <div className="lp-pricing-badge">{plan.badge}</div>}
              <div className="lp-pricing-name">{plan.name}</div>
              <div className="lp-pricing-price">
                {plan.price === null ? (
                  <span className="lp-pricing-custom">Custom</span>
                ) : (
                  <>
                    <span className="lp-pricing-dollar">$</span>
                    <span className="lp-pricing-amount">{annual ? plan.annualPrice : plan.price}</span>
                    {plan.price > 0 && <span className="lp-pricing-per">/mo</span>}
                  </>
                )}
              </div>
              <p className="lp-pricing-desc">{plan.desc}</p>
              <a
                href={plan.ctaHref}
                className={`lp-pricing-cta ${plan.highlight ? "lp-pricing-cta-primary" : ""}`}>
                {plan.cta}
              </a>
              <ul className="lp-pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="8" fill={plan.highlight ? "#6366f1" : "#e0e7ff"} />
                      <path
                        d="M4.5 8l2.5 2.5 4.5-5"
                        stroke={plan.highlight ? "white" : "#6366f1"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="lp-pricing-footer">
          All paid plans include a <strong>30-day money-back guarantee</strong>. No questions asked.
        </p>
      </div>
    </section>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        /* ── Reset / Base ─────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #e8e8f0; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #1e1b4b; -webkit-font-smoothing: antialiased; }

        /* ── Keyframes ────────────────────────────────── */
        @keyframes f1 { 0%,100%{transform:translateY(0px) rotate(0deg)} 33%{transform:translateY(-14px) rotate(1deg)} 66%{transform:translateY(6px) rotate(-1deg)} }
        @keyframes f2 { 0%,100%{transform:translateY(0px) rotate(0deg)} 40%{transform:translateY(10px) rotate(-1.5deg)} 70%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes f3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes f4 { 0%,100%{transform:translateY(0px) rotate(0deg)} 30%{transform:translateY(-6px) rotate(2deg)} 70%{transform:translateY(8px) rotate(-2deg)} }
        @keyframes f5 { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-12px) scale(1.02)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
        @keyframes twinkle { 0%,100%{opacity:1;transform:scale(1) rotate(0deg)} 50%{opacity:0.5;transform:scale(0.8) rotate(20deg)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* ── Typography ───────────────────────────────── */
        .lp-display { font-size: clamp(2.6rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; color: #1e1b4b; }
        .lp-grad-text { background: linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* ── Logo ─────────────────────────────────────── */
        .lp-logo-wrap { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .lp-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .lp-logo-pager { font-weight: 700; font-size: 1.1rem; color: #1e1b4b; letter-spacing: -0.02em; }
        .lp-logo-schedule { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.12em; color: #6366f1; text-transform: uppercase; margin-top: 1px; }

        /* ── Nav ──────────────────────────────────────── */
        .lp-nav-wrap { position: fixed; top: 16px; left: 50%; transform: translateX(-50%); z-index: 100; width: calc(100% - 32px); max-width: 1100px; }
        .lp-nav { background: rgba(255,255,255,0.88); backdrop-filter: blur(20px) saturate(180%); -webkit-backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(99,102,241,0.12); border-radius: 16px; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 24px rgba(99,102,241,0.08), 0 1px 0 rgba(255,255,255,0.8) inset; }
        .lp-nav-links { display: flex; gap: 32px; }
        .lp-nav-links a { font-size: 0.9rem; font-weight: 500; color: #374151; text-decoration: none; transition: color 0.2s; }
        .lp-nav-links a:hover { color: #6366f1; }
        .lp-nav-actions { display: flex; gap: 12px; align-items: center; }
        .lp-btn-ghost { font-size: 0.9rem; font-weight: 500; color: #374151; text-decoration: none; padding: 8px 16px; border-radius: 10px; transition: all 0.2s; }
        .lp-btn-ghost:hover { background: rgba(99,102,241,0.08); color: #6366f1; }
        .lp-btn-primary { font-size: 0.9rem; font-weight: 600; color: white; text-decoration: none; padding: 9px 20px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #818cf8); box-shadow: 0 2px 12px rgba(99,102,241,0.35); transition: all 0.2s; }
        .lp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.45); }
        .lp-nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; padding: 6px; color: #374151; }
        .lp-nav-mobile-menu { display: none; }

        @media (max-width: 768px) {
          .lp-nav-links { display: none; }
          .lp-nav-mobile-btn { display: flex; }
          .lp-nav-mobile-menu.open { display: flex; flex-direction: column; gap: 16px; padding: 20px 0 8px; border-top: 1px solid rgba(99,102,241,0.1); margin-top: 12px; }
          .lp-nav-mobile-menu a { font-size: 1rem; font-weight: 500; color: #374151; text-decoration: none; }
          .lp-nav { flex-wrap: wrap; }
        }

        /* ── Hero ─────────────────────────────────────── */
        .lp-hero { padding: 160px 24px 100px; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .lp-hero-label { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 100px; padding: 6px 14px; font-size: 0.8rem; font-weight: 600; color: #6366f1; margin-bottom: 24px; }
        .lp-hero-label svg { width: 14px; height: 14px; }
        .lp-hero-subtitle { font-size: clamp(1rem, 2vw, 1.2rem); color: #6b7280; max-width: 480px; margin: 20px 0 36px; line-height: 1.7; }
        .lp-hero-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .lp-btn-hero-primary { font-size: 1rem; font-weight: 700; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #818cf8); box-shadow: 0 4px 20px rgba(99,102,241,0.4); transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .lp-btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.5); }
        .lp-btn-hero-secondary { font-size: 1rem; font-weight: 600; color: #374151; text-decoration: none; padding: 13px 24px; border-radius: 12px; border: 1.5px solid #e5e7eb; background: white; transition: all 0.2s; }
        .lp-btn-hero-secondary:hover { border-color: #6366f1; color: #6366f1; }
        .lp-hero-trust { margin-top: 32px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .lp-hero-trust-label { font-size: 0.8rem; color: #9ca3af; font-weight: 500; }
        .lp-hero-avatars { display: flex; }
        .lp-hero-avatar { width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; margin-right: -8px; object-fit: cover; }
        .lp-hero-avatar-placeholder { width: 28px; height: 28px; border-radius: 50%; border: 2px solid white; margin-right: -8px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: 700; color: white; }
        .lp-hero-stars { color: #f59e0b; font-size: 0.85rem; display: flex; gap: 2px; }

        /* ── Hero Visual ──────────────────────────────── */
        .lp-hero-visual { position: relative; height: 500px; animation: f1 8s ease-in-out infinite; }
        .lp-hero-badge { position: absolute; background: white; border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8) inset; font-size: 0.8rem; font-weight: 600; color: #1e1b4b; white-space: nowrap; }
        .lp-hero-badge-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .lp-badge-1 { top: 40px; right: 0; animation: f2 7s ease-in-out infinite; }
        .lp-badge-2 { bottom: 100px; left: -20px; animation: f3 9s ease-in-out infinite; }
        .lp-badge-3 { top: 180px; right: -30px; animation: f4 6s ease-in-out infinite; }

        /* ── Calendar Card ────────────────────────────── */
        .lp-cal-card { background: white; border-radius: 20px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset; width: 100%; max-width: 340px; margin: 0 auto; }
        .lp-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .lp-cal-month { font-weight: 700; font-size: 1rem; color: #1e1b4b; }
        .lp-cal-nav { display: flex; gap: 4px; }
        .lp-cal-nav button { background: #f3f4f6; border: none; border-radius: 8px; width: 30px; height: 30px; cursor: pointer; font-size: 1rem; color: #6b7280; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .lp-cal-nav button:hover { background: #e0e7ff; color: #6366f1; }
        .lp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 20px; }
        .lp-cal-dayname { text-align: center; font-size: 0.7rem; font-weight: 600; color: #9ca3af; padding: 4px 0; }
        .lp-cal-date { text-align: center; font-size: 0.82rem; font-weight: 500; color: #374151; padding: 6px 0; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .lp-cal-date:hover:not(.lp-cal-empty):not(.lp-cal-selected) { background: #f3f4f6; }
        .lp-cal-empty { opacity: 0; pointer-events: none; }
        .lp-cal-selected { background: #6366f1 !important; color: white !important; font-weight: 700; }
        .lp-cal-busy { background: #fef3c7; color: #92400e; }
        .lp-cal-slots { border-top: 1px solid #f3f4f6; padding-top: 16px; }
        .lp-cal-slots-title { font-size: 0.78rem; font-weight: 600; color: #6b7280; margin-bottom: 10px; }
        .lp-cal-slot { background: #f0f0ff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 8px 12px; font-size: 0.82rem; font-weight: 600; color: #6366f1; margin-bottom: 6px; cursor: pointer; transition: all 0.15s; }
        .lp-cal-slot:hover { background: #6366f1; color: white; }

        /* ── Stats Bar ────────────────────────────────── */
        .lp-stats { background: #1e1b4b; padding: 60px 24px; }
        .lp-stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
        .lp-stat { text-align: center; }
        .lp-stat-num { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; color: white; letter-spacing: -0.03em; line-height: 1; margin-bottom: 6px; }
        .lp-stat-num span { background: linear-gradient(135deg, #818cf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-stat-label { font-size: 0.9rem; color: #a5b4fc; font-weight: 500; }

        /* ── Sections ─────────────────────────────────── */
        .lp-section { padding: 100px 24px; }
        .lp-section-inner { max-width: 1100px; margin: 0 auto; }
        .lp-section-label { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6366f1; margin-bottom: 16px; }
        .lp-section-label::before { content: ""; display: block; width: 20px; height: 2px; background: #6366f1; border-radius: 2px; }
        .lp-section-title { font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 800; color: #1e1b4b; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 16px; }
        .lp-section-sub { font-size: 1.1rem; color: #6b7280; max-width: 580px; line-height: 1.7; margin-bottom: 60px; }

        /* ── Features ─────────────────────────────────── */
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-feature-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); transition: all 0.3s; position: relative; overflow: hidden; }
        .lp-feature-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(129,140,248,0.06)); opacity: 0; transition: opacity 0.3s; }
        .lp-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(99,102,241,0.15); }
        .lp-feature-card:hover::before { opacity: 1; }
        .lp-feature-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #ede9fe, #e0e7ff); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 20px; }
        .lp-feature-title { font-size: 1.1rem; font-weight: 700; color: #1e1b4b; margin-bottom: 10px; }
        .lp-feature-desc { font-size: 0.9rem; color: #6b7280; line-height: 1.65; }

        /* ── Integrations ─────────────────────────────── */
        .lp-integrations { background: white; padding: 100px 24px; }
        .lp-int-map { position: relative; max-width: 720px; margin: 0 auto; height: 340px; }
        .lp-int-hub { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; }
        .lp-int-hub-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #818cf8); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(99,102,241,0.4); animation: pulse 3s ease-in-out infinite; }
        .lp-int-node { position: absolute; transform: translate(-50%, -50%); }
        .lp-int-node-inner { background: white; border-radius: 14px; padding: 10px 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 600; color: #374151; white-space: nowrap; border: 1.5px solid #f3f4f6; transition: all 0.3s; }
        .lp-int-node-inner:hover { border-color: #6366f1; transform: scale(1.05); box-shadow: 0 8px 32px rgba(99,102,241,0.2); }
        .lp-int-node-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

        /* ── Testimonials ─────────────────────────────── */
        .lp-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lp-testi-card { background: white; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); transition: transform 0.3s; }
        .lp-testi-card:hover { transform: translateY(-3px); }
        .lp-testi-stars { display: flex; gap: 3px; color: #f59e0b; margin-bottom: 16px; font-size: 0.9rem; }
        .lp-testi-quote { font-size: 0.95rem; color: #374151; line-height: 1.7; margin-bottom: 24px; font-style: italic; }
        .lp-testi-quote::before { content: '\\201C'; }
        .lp-testi-quote::after { content: '\\201D'; }
        .lp-testi-author { display: flex; align-items: center; gap: 12px; }
        .lp-testi-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; color: white; flex-shrink: 0; }
        .lp-testi-name { font-weight: 700; font-size: 0.9rem; color: #1e1b4b; }
        .lp-testi-role { font-size: 0.78rem; color: #9ca3af; margin-top: 1px; }

        /* ── Pricing ──────────────────────────────────── */
        .lp-pricing-toggle { display: flex; align-items: center; gap: 14px; margin-bottom: 48px; font-size: 0.9rem; font-weight: 600; color: #9ca3af; }
        .lp-toggle-active { color: #1e1b4b; }
        .lp-toggle-btn { width: 48px; height: 26px; border-radius: 13px; background: #e5e7eb; border: none; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
        .lp-toggle-btn.lp-toggle-on { background: #6366f1; }
        .lp-toggle-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.2s; display: block; }
        .lp-toggle-btn.lp-toggle-on .lp-toggle-knob { transform: translateX(22px); }
        .lp-toggle-save { background: #dcfce7; color: #16a34a; border-radius: 100px; padding: 2px 8px; font-size: 0.72rem; margin-left: 6px; }
        .lp-pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; align-items: start; }
        .lp-pricing-card { background: white; border-radius: 20px; padding: 28px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 2px solid transparent; transition: all 0.3s; position: relative; overflow: hidden; }
        .lp-pricing-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(99,102,241,0.12); }
        .lp-pricing-highlight { border-color: #6366f1; box-shadow: 0 8px 40px rgba(99,102,241,0.2); }
        .lp-pricing-badge { position: absolute; top: 16px; right: 16px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; font-size: 0.7rem; font-weight: 700; border-radius: 100px; padding: 4px 10px; }
        .lp-pricing-name { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; margin-bottom: 12px; }
        .lp-pricing-price { display: flex; align-items: baseline; gap: 2px; margin-bottom: 6px; }
        .lp-pricing-dollar { font-size: 1.2rem; font-weight: 700; color: #1e1b4b; }
        .lp-pricing-amount { font-size: 3rem; font-weight: 800; color: #1e1b4b; letter-spacing: -0.04em; line-height: 1; }
        .lp-pricing-per { font-size: 0.9rem; color: #9ca3af; font-weight: 500; margin-left: 2px; }
        .lp-pricing-custom { font-size: 2rem; font-weight: 800; color: #1e1b4b; }
        .lp-pricing-desc { font-size: 0.82rem; color: #9ca3af; margin-bottom: 20px; line-height: 1.5; }
        .lp-pricing-cta { display: block; text-align: center; padding: 11px 16px; border-radius: 10px; font-size: 0.9rem; font-weight: 700; text-decoration: none; border: 2px solid #e5e7eb; color: #374151; transition: all 0.2s; margin-bottom: 24px; }
        .lp-pricing-cta:hover { border-color: #6366f1; color: #6366f1; }
        .lp-pricing-cta-primary { background: linear-gradient(135deg, #6366f1, #818cf8); color: white !important; border-color: transparent !important; box-shadow: 0 4px 16px rgba(99,102,241,0.35); }
        .lp-pricing-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.45); }
        .lp-pricing-features { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .lp-pricing-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: #374151; line-height: 1.4; }
        .lp-pricing-features svg { flex-shrink: 0; margin-top: 1px; }
        .lp-pricing-footer { text-align: center; margin-top: 40px; font-size: 0.9rem; color: #9ca3af; }

        /* ── Final CTA ────────────────────────────────── */
        .lp-cta { padding: 80px 24px; }
        .lp-cta-card { max-width: 1100px; margin: 0 auto; background: #1e1b4b; border-radius: 28px; padding: 80px 48px; text-align: center; position: relative; overflow: hidden; }
        .lp-cta-card::before { content: ""; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%); }
        .lp-cta-card::after { content: ""; position: absolute; bottom: -80px; left: -80px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%); }
        .lp-cta-label { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.3); border-radius: 100px; padding: 6px 16px; font-size: 0.78rem; font-weight: 600; color: #a5b4fc; margin-bottom: 24px; position: relative; z-index: 1; }
        .lp-cta-title { font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; color: white; letter-spacing: -0.03em; line-height: 1.12; margin-bottom: 20px; position: relative; z-index: 1; }
        .lp-cta-sub { font-size: 1.1rem; color: #a5b4fc; max-width: 480px; margin: 0 auto 36px; line-height: 1.7; position: relative; z-index: 1; }
        .lp-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1; }
        .lp-btn-cta-primary { font-size: 1rem; font-weight: 700; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #818cf8); box-shadow: 0 4px 20px rgba(99,102,241,0.4); transition: all 0.2s; }
        .lp-btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(99,102,241,0.5); }
        .lp-btn-cta-secondary { font-size: 1rem; font-weight: 600; color: white; text-decoration: none; padding: 13px 24px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.2); transition: all 0.2s; }
        .lp-btn-cta-secondary:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        .lp-cta-badges { display: flex; justify-content: center; gap: 16px; margin-top: 40px; flex-wrap: wrap; position: relative; z-index: 1; }
        .lp-cta-badge { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 6px 14px; font-size: 0.78rem; font-weight: 600; color: #e0e7ff; }

        /* ── Footer ───────────────────────────────────── */
        .lp-footer { background: #111827; padding: 64px 24px 32px; }
        .lp-footer-inner { max-width: 1100px; margin: 0 auto; }
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .lp-footer-brand { }
        .lp-footer-tagline { font-size: 0.9rem; color: #6b7280; line-height: 1.7; margin-top: 14px; max-width: 260px; }
        .lp-footer-col-title { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 16px; }
        .lp-footer-col { display: flex; flex-direction: column; gap: 10px; }
        .lp-footer-col a { font-size: 0.9rem; color: #6b7280; text-decoration: none; transition: color 0.2s; }
        .lp-footer-col a:hover { color: #a5b4fc; }
        .lp-footer-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 28px; }
        .lp-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .lp-footer-copy { font-size: 0.82rem; color: #4b5563; }
        .lp-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .lp-footer-links a { font-size: 0.82rem; color: #4b5563; text-decoration: none; transition: color 0.2s; }
        .lp-footer-links a:hover { color: #a5b4fc; }

        /* ── Mobile Responsive ────────────────────────── */
        @media (max-width: 1024px) {
          .lp-pricing-grid { grid-template-columns: repeat(2, 1fr); }
          .lp-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .lp-hero { grid-template-columns: 1fr; padding: 120px 24px 60px; gap: 48px; }
          .lp-hero-visual { height: 360px; animation: none; }
          .lp-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-testi-grid { grid-template-columns: 1fr; }
          .lp-pricing-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .lp-footer-brand { grid-column: 1 / -1; }
          .lp-cta-card { padding: 48px 24px; }
          .lp-int-map { height: 280px; }
          .lp-hero-badge { display: none; }
          .lp-badge-1, .lp-badge-2, .lp-badge-3 { display: none; }
        }
        @media (max-width: 480px) {
          .lp-stats-inner { grid-template-columns: 1fr 1fr; gap: 24px; }
          .lp-footer-grid { grid-template-columns: 1fr; }
          .lp-display { font-size: 2.2rem; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="lp-nav-wrap">
        <div className="lp-nav">
          <Logo />
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#integrations">Integrations</a>
            <a href="#pricing">Pricing</a>
            <a href="/security">Security</a>
          </div>
          <div className="lp-nav-actions">
            <a href="/auth/login" className="lp-btn-ghost">
              Log in
            </a>
            <a href="/auth/signup" className="lp-btn-primary">
              Get started free
            </a>
          </div>
          <button
            className="lp-nav-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {mobileOpen ? (
                <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <path
                    d="M3 6h16M3 11h16M3 16h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
            </svg>
          </button>
          <div className={`lp-nav-mobile-menu ${mobileOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="#integrations" onClick={() => setMobileOpen(false)}>
              Integrations
            </a>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>
              Pricing
            </a>
            <a href="/auth/login" onClick={() => setMobileOpen(false)}>
              Log in
            </a>
            <a href="/auth/signup" onClick={() => setMobileOpen(false)}>
              Get started free →
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="lp-hero">
        <div>
          <div className="lp-hero-label">
            <Sparkle />
            Scheduling, reimagined
          </div>
          <h1 className="lp-display">
            The scheduling platform that <span className="lp-grad-text">works for you</span>
          </h1>
          <p className="lp-hero-subtitle">
            Let clients book meetings on your terms. Smart availability, automated reminders, and AI-powered
            scheduling — all in one beautifully simple platform.
          </p>
          <div className="lp-hero-actions">
            <a href="/auth/signup" className="lp-btn-hero-primary">
              Get started free
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href="#features" className="lp-btn-hero-secondary">
              See how it works
            </a>
          </div>
          <div className="lp-hero-trust">
            <div className="lp-hero-avatars">
              {["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"].map((color, i) => (
                <div
                  key={i}
                  className="lp-hero-avatar-placeholder"
                  style={{ background: color, zIndex: 5 - i }}>
                  {["SC", "MW", "ER", "JD", "AL"][i]}
                </div>
              ))}
            </div>
            <div className="lp-hero-stars">{"★★★★★"}</div>
            <span className="lp-hero-trust-label">Loved by 50,000+ professionals</span>
          </div>
        </div>
        <div className="lp-hero-visual">
          <FloatingCalendar />
          <div className="lp-hero-badge lp-badge-1">
            <div className="lp-hero-badge-dot" style={{ background: "#10b981" }} />
            Meeting confirmed — 9:00 AM
          </div>
          <div className="lp-hero-badge lp-badge-2">
            <div className="lp-hero-badge-dot" style={{ background: "#6366f1" }} />
            Viola AI found the perfect slot
          </div>
          <div className="lp-hero-badge lp-badge-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M7 1v2M7 11v2M1 7h2M11 7h2M2.93 2.93l1.41 1.41M9.66 9.66l1.41 1.41M2.93 11.07l1.41-1.41M9.66 4.34l1.41-1.41"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            No back-and-forth needed
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────── */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          <div className="lp-stat">
            <div className="lp-stat-num">
              <AnimatedCounter target={2} suffix="M+" />
            </div>
            <div className="lp-stat-label">Meetings scheduled</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">
              <AnimatedCounter target={50000} suffix="+" />
            </div>
            <div className="lp-stat-label">Active users</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">
              <AnimatedCounter target={70} suffix="+" />
            </div>
            <div className="lp-stat-label">Integrations</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">
              <span>99.9%</span>
            </div>
            <div className="lp-stat-label">Uptime SLA</div>
          </div>
        </div>
      </div>

      {/* ── Features ──────────────────────────────────── */}
      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-label">Features</div>
          <h2 className="lp-section-title">Everything you need to schedule smarter</h2>
          <p className="lp-section-sub">
            From solo professionals to enterprise teams — PagerSchedule adapts to how you work.
          </p>
          <div className="lp-features-grid">
            {[
              {
                icon: "📅",
                title: "Smart calendar sync",
                desc: "Sync with Google Calendar, Outlook, Apple Calendar, and more. Your availability stays perfectly up to date — automatically.",
              },
              {
                icon: "🤖",
                title: "Viola AI assistant",
                desc: "Our AI finds the best time for everyone, handles rescheduling requests, and learns your preferences over time.",
              },
              {
                icon: "💳",
                title: "Built-in payments",
                desc: "Charge for consultations, coaching sessions, or any booking. Stripe-powered, no extra setup. Money lands in your account.",
              },
              {
                icon: "🔀",
                title: "Team routing",
                desc: "Round-robin, fixed, or priority-based routing. Collective scheduling. Your whole team's availability, one booking link.",
              },
              {
                icon: "🔐",
                title: "Enterprise SSO",
                desc: "SAML-based single sign-on, SCIM provisioning, audit logs, and custom SLAs. Security and compliance built in.",
              },
              {
                icon: "📊",
                title: "Analytics & insights",
                desc: "Track meeting volume, no-show rates, busiest hours, and team performance. Make data-driven decisions about your time.",
              },
            ].map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className="lp-feature-icon">{f.icon}</div>
                <div className="lp-feature-title">{f.title}</div>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────────────── */}
      <div className="lp-integrations" id="integrations">
        <div className="lp-section-inner" style={{ textAlign: "center" }}>
          <div className="lp-section-label" style={{ justifyContent: "center" }}>
            Integrations
          </div>
          <h2 className="lp-section-title">Connects with your entire stack</h2>
          <p className="lp-section-sub" style={{ margin: "0 auto 60px" }}>
            70+ integrations including Zoom, Google Meet, Salesforce, HubSpot, Slack, and more.
          </p>
          <div className="lp-int-map">
            {/* SVG connection lines */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              aria-hidden="true">
              {[
                { x1: "50%", y1: "50%", x2: "20%", y2: "15%" },
                { x1: "50%", y1: "50%", x2: "80%", y2: "15%" },
                { x1: "50%", y1: "50%", x2: "10%", y2: "55%" },
                { x1: "50%", y1: "50%", x2: "90%", y2: "55%" },
                { x1: "50%", y1: "50%", x2: "25%", y2: "88%" },
                { x1: "50%", y1: "50%", x2: "75%", y2: "88%" },
              ].map((line, i) => (
                <line
                  key={i}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#e0e7ff"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              ))}
            </svg>

            {/* Center hub */}
            <div className="lp-int-hub">
              <div className="lp-int-hub-circle">
                <Logo size={40} />
              </div>
            </div>

            {/* Integration nodes */}
            {[
              {
                label: "Google Calendar",
                icon: "📅",
                bg: "#fef9c3",
                top: "15%",
                left: "20%",
                anim: "f1 7s ease-in-out infinite",
              },
              {
                label: "Zoom",
                icon: "🎥",
                bg: "#dbeafe",
                top: "15%",
                left: "80%",
                anim: "f2 9s ease-in-out infinite",
              },
              {
                label: "Slack",
                icon: "💬",
                bg: "#fce7f3",
                top: "55%",
                left: "10%",
                anim: "f3 8s ease-in-out infinite",
              },
              {
                label: "Salesforce",
                icon: "☁️",
                bg: "#e0f2fe",
                top: "55%",
                left: "90%",
                anim: "f4 7s ease-in-out infinite",
              },
              {
                label: "Stripe",
                icon: "💳",
                bg: "#f3e8ff",
                top: "88%",
                left: "25%",
                anim: "f5 10s ease-in-out infinite",
              },
              {
                label: "HubSpot",
                icon: "🧡",
                bg: "#fff7ed",
                top: "88%",
                left: "75%",
                anim: "f1 8s ease-in-out 2s infinite",
              },
            ].map((node) => (
              <div
                key={node.label}
                className="lp-int-node"
                style={{ top: node.top, left: node.left, animation: node.anim }}>
                <div className="lp-int-node-inner">
                  <div className="lp-int-node-icon" style={{ background: node.bg }}>
                    {node.icon}
                  </div>
                  {node.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ──────────────────────────────── */}
      <section className="lp-section">
        <div className="lp-section-inner">
          <div className="lp-section-label">Testimonials</div>
          <h2 className="lp-section-title">Trusted by professionals worldwide</h2>
          <p className="lp-section-sub">See what teams are saying about PagerSchedule.</p>
          <div className="lp-testi-grid">
            {[
              {
                quote:
                  "PagerSchedule cut my scheduling overhead by 80%. My clients love the clean booking page, and the AI reminders mean virtually zero no-shows.",
                name: "Sarah Chen",
                role: "Executive Coach, San Francisco",
                initials: "SC",
                color: "#6366f1",
              },
              {
                quote:
                  "We run a 12-person sales team and the round-robin routing is flawless. Leads get booked with the right rep instantly. Revenue is up 40% since switching.",
                name: "Marcus Williams",
                role: "VP Sales, TechFlow Inc.",
                initials: "MW",
                color: "#8b5cf6",
              },
              {
                quote:
                  "The GDPR compliance and enterprise SSO made this an easy sell to our security team. Best scheduling tool we've used in 10 years of running this practice.",
                name: "Emma Rodriguez",
                role: "Operations Director, MedGroup UK",
                initials: "ER",
                color: "#06b6d4",
              },
            ].map((t) => (
              <div key={t.name} className="lp-testi-card">
                <div className="lp-testi-stars">{"★★★★★"}</div>
                <p className="lp-testi-quote">{t.quote}</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar" style={{ background: t.color }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="lp-testi-name">{t.name}</div>
                    <div className="lp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────── */}
      <PricingSection />

      {/* ── Final CTA ─────────────────────────────────── */}
      <div className="lp-cta">
        <div className="lp-cta-card">
          <div className="lp-cta-label">
            <Sparkle style={{ filter: "brightness(2)" }} />
            Start scheduling smarter today
          </div>
          <h2 className="lp-cta-title">
            Your time is your most
            <br />
            valuable resource
          </h2>
          <p className="lp-cta-sub">
            Join 50,000+ professionals who have eliminated scheduling chaos. Free to start. No credit card
            required.
          </p>
          <div className="lp-cta-actions">
            <a href="/auth/signup" className="lp-btn-cta-primary">
              Create free account
            </a>
            <a href="/auth/login" className="lp-btn-cta-secondary">
              Already have an account?
            </a>
          </div>
          <div className="lp-cta-badges">
            {["SOC2 Ready", "GDPR Compliant", "99.99% SLA", "30-day guarantee"].map((b) => (
              <div key={b} className="lp-cta-badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M2 6l2.5 2.5 5.5-5"
                    stroke="#a5b4fc"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Logo />
              <p className="lp-footer-tagline">
                The modern scheduling platform for professionals, teams, and enterprises.
              </p>
            </div>
            <div>
              <div className="lp-footer-col-title">Product</div>
              <div className="lp-footer-col">
                <a href="#features">Features</a>
                <a href="#integrations">Integrations</a>
                <a href="#pricing">Pricing</a>
                <a href="/auth/signup">Get started</a>
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">Legal</div>
              <div className="lp-footer-col">
                <a href="/terms">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/cookies">Cookie Policy</a>
                <a href="/dpa">DPA</a>
                <a href="/acceptable-use">Acceptable Use</a>
              </div>
            </div>
            <div>
              <div className="lp-footer-col-title">Company</div>
              <div className="lp-footer-col">
                <a href="/security">Security</a>
                <a href="/sla">SLA</a>
                <a href="/refunds">Refund Policy</a>
                <a href="mailto:support@pagerschedule.com">Support</a>
                <a href="mailto:legal@pagerschedule.com">Legal</a>
              </div>
            </div>
          </div>
          <div className="lp-footer-divider" />
          <div className="lp-footer-bottom">
            <div className="lp-footer-copy">
              © {new Date().getFullYear()} PagerSchedule. All rights reserved.
            </div>
            <div className="lp-footer-links">
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/cookies">Cookies</a>
              <a href="/security">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
