"use client";

import { useState } from "react";

interface ViolaSettingsViewProps {
  userId: string;
  messageCount: number;
  plan: string;
}

const FREE_LIMIT = 20;

export default function ViolaSettingsView({ messageCount, plan }: ViolaSettingsViewProps) {
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [showOnBookingPage, setShowOnBookingPage] = useState(true);
  const [greeting, setGreeting] = useState("Hi! I'm Viola, how can I help you today?");
  const [saved, setSaved] = useState(false);

  const isPaidPlan = plan !== "FREE" && plan !== "free";
  const limit = isPaidPlan ? null : FREE_LIMIT;

  function handleSave() {
    // Settings are stored in state for now — future: persist to user metadata
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px" }}>
      <style>{`
        .vs-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 28px 28px;
          margin-bottom: 20px;
        }
        .vs-section-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 4px;
        }
        .vs-section-sub {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .vs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-top: 1px solid #f3f4f6;
        }
        .vs-row:first-of-type { border-top: none; }
        .vs-row-label { font-size: 0.9rem; font-weight: 500; color: #374151; }
        .vs-row-sub { font-size: 0.78rem; color: #9ca3af; margin-top: 2px; }
        .vs-toggle {
          width: 44px; height: 24px; border-radius: 12px;
          background: #e5e7eb; border: none; cursor: pointer;
          position: relative; transition: background 0.2s; flex-shrink: 0;
        }
        .vs-toggle.on { background: #6366f1; }
        .vs-toggle-knob {
          position: absolute; top: 2px; left: 2px;
          width: 20px; height: 20px; border-radius: 50%;
          background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s; display: block;
        }
        .vs-toggle.on .vs-toggle-knob { transform: translateX(20px); }
        .vs-textarea {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 10px 14px; font-size: 0.9rem; font-family: inherit;
          color: #374151; resize: vertical; min-height: 70px; outline: none;
          transition: border-color 0.15s;
        }
        .vs-textarea:focus { border-color: #c4b5fd; }
        .vs-save-btn {
          margin-top: 12px; padding: 9px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; font-size: 0.9rem; font-weight: 600;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .vs-save-btn:hover { opacity: 0.9; }
        .vs-usage-bar-wrap {
          background: #f3f4f6; border-radius: 8px; height: 8px;
          margin: 10px 0 6px; overflow: hidden;
        }
        .vs-usage-bar {
          height: 100%; border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          transition: width 0.4s;
        }
        .vs-usage-label {
          font-size: 0.82rem; color: #6b7280;
          display: flex; justify-content: space-between;
        }
        .vs-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #ede9fe; border-radius: 100px;
          padding: 4px 12px; font-size: 0.78rem; font-weight: 600; color: #6366f1;
          margin-bottom: 20px;
        }
        .vs-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .vs-header-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          display: flex; align-items: center; justify-content: center;
        }
        .vs-header-title { font-size: 1.3rem; font-weight: 800; color: #1e1b4b; }
        .vs-header-sub { font-size: 0.85rem; color: #6b7280; margin-top: 2px; }
      `}</style>

      {/* Page header */}
      <div className="vs-header">
        <div className="vs-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {[5, 9, 7, 13, 9, 11].map((h, i) => (
              <rect
                key={i}
                x={3 + i * 3}
                y={(24 - h) / 2}
                width={2}
                height={h}
                rx={1}
                fill="white"
                opacity={0.85 + (i % 2) * 0.15}
              />
            ))}
          </svg>
        </div>
        <div>
          <div className="vs-header-title">Viola AI Settings</div>
          <div className="vs-header-sub">Personalise your PagerSchedule assistant</div>
        </div>
      </div>

      {/* Visibility toggles */}
      <div className="vs-card">
        <div className="vs-section-title">Enable Viola</div>
        <div className="vs-section-sub">Choose where Viola appears for you and your visitors.</div>

        <div className="vs-row">
          <div>
            <div className="vs-row-label">Show on my dashboard</div>
            <div className="vs-row-sub">Viola appears as a floating button on all your dashboard pages</div>
          </div>
          <button
            className={`vs-toggle ${showOnDashboard ? "on" : ""}`}
            onClick={() => setShowOnDashboard(!showOnDashboard)}
            aria-label={showOnDashboard ? "Disable on dashboard" : "Enable on dashboard"}>
            <span className="vs-toggle-knob" />
          </button>
        </div>

        <div className="vs-row">
          <div>
            <div className="vs-row-label">Show on my booking page</div>
            <div className="vs-row-sub">Visitors can chat with Viola while booking a meeting with you</div>
          </div>
          <button
            className={`vs-toggle ${showOnBookingPage ? "on" : ""}`}
            onClick={() => setShowOnBookingPage(!showOnBookingPage)}
            aria-label={showOnBookingPage ? "Disable on booking page" : "Enable on booking page"}>
            <span className="vs-toggle-knob" />
          </button>
        </div>
      </div>

      {/* Greeting message */}
      <div className="vs-card">
        <div className="vs-section-title">Greeting message</div>
        <div className="vs-section-sub">
          Customise what Viola says when someone opens the chat on your booking page.
        </div>
        <textarea
          className="vs-textarea"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          maxLength={200}
          aria-label="Custom greeting message"
        />
        <div style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "right", marginTop: 4 }}>
          {greeting.length}/200
        </div>
        <button className="vs-save-btn" onClick={handleSave}>
          {saved ? "✓ Saved" : "Save greeting"}
        </button>
      </div>

      {/* Usage */}
      <div className="vs-card">
        <div className="vs-section-title">Usage this month</div>
        <div className="vs-section-sub">Your Viola message usage for the current billing period.</div>

        <div className="vs-badge">{isPaidPlan ? "Pro Plan — Unlimited" : "Free Plan"}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.03em" }}>
            {messageCount}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
            {limit ? `of ${limit} messages` : "messages sent"}
          </span>
        </div>

        {limit && (
          <>
            <div className="vs-usage-bar-wrap">
              <div
                className="vs-usage-bar"
                style={{ width: `${Math.min((messageCount / limit) * 100, 100)}%` }}
              />
            </div>
            <div className="vs-usage-label">
              <span>{messageCount} used</span>
              <span>{Math.max(limit - messageCount, 0)} remaining</span>
            </div>
            {messageCount >= limit && (
              <p style={{ fontSize: "0.85rem", color: "#ef4444", marginTop: 10 }}>
                You have reached your monthly limit.{" "}
                <a href="/settings/billing" style={{ color: "#6366f1", fontWeight: 600 }}>
                  Upgrade to Pro
                </a>{" "}
                for unlimited Viola messages.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
