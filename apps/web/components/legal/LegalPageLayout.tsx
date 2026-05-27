import { DM_Sans, DM_Serif_Display } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

const LEGAL_LINKS = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Security", href: "/security" },
  { label: "DPA", href: "/dpa" },
  { label: "SLA", href: "/sla" },
  { label: "Acceptable Use", href: "/acceptable-use" },
  { label: "Refunds", href: "/refunds" },
];

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className={dmSans.className} style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0 24px",
        }}>
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "60px",
          }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}>
            {/* Waveform circle */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
                <rect x="0" y="4" width="2" height="4" rx="1" fill="white" />
                <rect x="4" y="1" width="2" height="10" rx="1" fill="white" />
                <rect x="8" y="0" width="2" height="12" rx="1" fill="white" />
                <rect x="12" y="2" width="2" height="8" rx="1" fill="white" />
                <rect x="16" y="4" width="2" height="4" rx="1" fill="white" />
              </svg>
            </div>
            {/* Wordmark */}
            <div style={{ lineHeight: 1.1 }}>
              <span
                style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#111827",
                  letterSpacing: "-0.01em",
                }}>
                Pager
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#6366f1",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}>
                SCHEDULE
              </span>
            </div>
          </Link>

          {/* Back link */}
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: "#6366f1",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}>
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "40px 24px",
        }}>
        {/* Page title */}
        <h1
          className={dmSerif.className}
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            fontStyle: "italic",
            color: "#111827",
            marginBottom: "8px",
            lineHeight: 1.2,
            fontWeight: 400,
          }}>
          {title}
        </h1>

        {/* Last updated */}
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "32px" }}>Last updated: May 2026</p>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "40px" }} />

        {/* Content */}
        <div style={{ color: "#4b5563" }}>{children}</div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "32px",
          paddingBottom: "40px",
          marginTop: "60px",
          backgroundColor: "#ffffff",
        }}>
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "0 24px",
          }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
              justifyContent: "center",
            }}>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  textDecoration: "none",
                }}>
                {link.label}
              </Link>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
            © 2026 PagerSchedule. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Hover styles via global CSS injection */}
      <style>{`
        .legal-link:hover { color: #4f46e5 !important; }
        .legal-h2 { font-size: 18px; font-weight: 700; color: #111827; margin-top: 36px; margin-bottom: 12px; }
        .legal-h3 { font-size: 15px; font-weight: 600; color: #4b5563; margin-top: 24px; margin-bottom: 8px; }
        .legal-p { font-size: 15px; line-height: 1.75; color: #4b5563; margin-bottom: 16px; }
        .legal-ul, .legal-ol { font-size: 15px; line-height: 1.75; color: #4b5563; padding-left: 24px; margin-bottom: 16px; }
        .legal-ul li, .legal-ol li { margin-bottom: 8px; }
        .legal-a { color: #6366f1; text-decoration: underline; }
        .legal-a:hover { color: #4f46e5; }
        .legal-box {
          background: #f0effe;
          border-left: 3px solid #6366f1;
          padding: 16px 20px;
          border-radius: 0 8px 8px 0;
          margin-bottom: 24px;
        }
        .legal-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
        .legal-table th { background: #f8fafc; color: #111827; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        .legal-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #4b5563; vertical-align: top; }
        .legal-table tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
