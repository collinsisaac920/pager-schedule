"use client";

import { useEffect, useState } from "react";

const DESIGN = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  brand: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
};

const TEMPLATE_DEFS = [
  {
    key: "booking_confirmation",
    label: "Booking Confirmation",
    variables: ["{{attendee_name}}", "{{event_title}}", "{{start_time}}", "{{location}}", "{{host_name}}"],
  },
  {
    key: "booking_cancellation",
    label: "Booking Cancellation",
    variables: ["{{attendee_name}}", "{{event_title}}", "{{start_time}}", "{{cancel_reason}}"],
  },
  {
    key: "booking_reminder",
    label: "Booking Reminder",
    variables: ["{{attendee_name}}", "{{event_title}}", "{{start_time}}", "{{location}}", "{{join_url}}"],
  },
  {
    key: "new_booking_notification",
    label: "New Booking Notification",
    variables: ["{{attendee_name}}", "{{attendee_email}}", "{{event_title}}", "{{start_time}}"],
  },
];

const DEFAULT_SUBJECTS: Record<string, string> = {
  booking_confirmation: "Your booking is confirmed: {{event_title}}",
  booking_cancellation: "Booking cancelled: {{event_title}}",
  booking_reminder: "Reminder: {{event_title}} starts soon",
  new_booking_notification: "New booking: {{event_title}} with {{attendee_name}}",
};

const DEFAULT_BODIES: Record<string, string> = {
  booking_confirmation:
    "Hi {{attendee_name}},\n\nYour booking for {{event_title}} has been confirmed.\n\nDate & Time: {{start_time}}\nLocation: {{location}}\nHost: {{host_name}}\n\nSee you then!",
  booking_cancellation:
    "Hi {{attendee_name}},\n\nYour booking for {{event_title}} on {{start_time}} has been cancelled.\n\n{{cancel_reason}}",
  booking_reminder:
    "Hi {{attendee_name}},\n\nThis is a reminder that {{event_title}} is coming up on {{start_time}}.\n\nLocation: {{location}}\nJoin: {{join_url}}",
  new_booking_notification:
    "You have a new booking!\n\nAttendee: {{attendee_name}} ({{attendee_email}})\nEvent: {{event_title}}\nTime: {{start_time}}",
};

interface EmailTemplate {
  id: string;
  templateKey: string;
  subject: string;
  bodyText: string;
  hideBranding: boolean;
  updatedAt: string;
}

interface EmailTemplatesViewProps {
  teamId: number;
}

export default function EmailTemplatesView({ teamId }: EmailTemplatesViewProps) {
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [activeKey, setActiveKey] = useState(TEMPLATE_DEFS[0].key);
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[TEMPLATE_DEFS[0].key]);
  const [bodyText, setBodyText] = useState(DEFAULT_BODIES[TEMPLATE_DEFS[0].key]);
  const [hideBranding, setHideBranding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/email-templates`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, EmailTemplate> = {};
        for (const t of data.templates ?? []) map[t.templateKey] = t;
        setTemplates(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  const selectKey = (key: string) => {
    setActiveKey(key);
    const existing = templates[key];
    setSubject(existing?.subject ?? DEFAULT_SUBJECTS[key] ?? "");
    setBodyText(existing?.bodyText ?? DEFAULT_BODIES[key] ?? "");
    setHideBranding(existing?.hideBranding ?? false);
    setMessage("");
    setPreview(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/teams/${teamId}/email-templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateKey: activeKey, subject, bodyText, hideBranding }),
    });
    const data = await res.json();
    if (res.ok) {
      setTemplates((prev) => ({ ...prev, [activeKey]: data.template }));
      setMessage("Template saved.");
    } else {
      setMessage(data.error ?? "Failed to save.");
    }
    setSaving(false);
  };

  const insertVariable = (v: string) => {
    setBodyText((prev) => prev + v);
  };

  const SAMPLE: Record<string, string> = {
    "{{attendee_name}}": "Jane Smith",
    "{{event_title}}": "30 Min Meeting",
    "{{start_time}}": "Mon, June 2 at 2:00 PM",
    "{{location}}": "https://meet.example.com/abc",
    "{{host_name}}": "Alice Johnson",
    "{{cancel_reason}}": "The host had a conflict.",
    "{{join_url}}": "https://meet.example.com/abc",
    "{{attendee_email}}": "jane@example.com",
  };

  const previewBody = bodyText.replace(/\{\{[^}]+\}\}/g, (m) => SAMPLE[m] ?? m);

  const activeDef = TEMPLATE_DEFS.find((t) => t.key === activeKey)!;

  if (loading) return <div style={{ color: DESIGN.muted, padding: 24 }}>Loading…</div>;

  return (
    <div style={{ background: DESIGN.bg, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div
          style={{
            background: DESIGN.card,
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 12,
            overflow: "hidden",
            minWidth: 200,
            flexShrink: 0,
          }}>
          {TEMPLATE_DEFS.map((t) => (
            <button
              key={t.key}
              onClick={() => selectKey(t.key)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                border: "none",
                borderBottom: `1px solid ${DESIGN.border}`,
                background: activeKey === t.key ? `${DESIGN.brand}08` : "transparent",
                borderLeft: activeKey === t.key ? `3px solid ${DESIGN.brand}` : "3px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                color: activeKey === t.key ? DESIGN.brand : DESIGN.text,
                fontWeight: activeKey === t.key ? 600 : 400,
              }}>
              {t.label}
              {templates[t.key] && (
                <span style={{ fontSize: 10, color: "#16a34a", marginLeft: 6 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Hide branding toggle */}
          <div
            style={{
              background: DESIGN.card,
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 12,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: DESIGN.text }}>{activeDef.label}</div>
              <div style={{ fontSize: 12, color: DESIGN.muted, marginTop: 2 }}>
                Customise this email template for your team
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: DESIGN.muted }}>Hide branding</span>
              <input
                type="checkbox"
                checked={hideBranding}
                onChange={(e) => setHideBranding(e.target.checked)}
                style={{ accentColor: DESIGN.brand, width: 16, height: 16 }}
              />
            </label>
          </div>

          {/* Subject */}
          <div
            style={{
              background: DESIGN.card,
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 12,
              padding: 20,
            }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DESIGN.text }}>Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                }}
              />
            </label>
          </div>

          {/* Body + variables */}
          <div
            style={{
              background: DESIGN.card,
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 12,
              padding: 20,
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DESIGN.text }}>Body</span>
              <button
                onClick={() => setPreview((p) => !p)}
                style={{
                  background: "transparent",
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  color: DESIGN.muted,
                }}>
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <div
                style={{
                  background: "#f8fafc",
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13,
                  color: DESIGN.text,
                  whiteSpace: "pre-wrap",
                  minHeight: 160,
                }}>
                {previewBody}
              </div>
            ) : (
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={10}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "monospace",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            )}

            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: DESIGN.muted, marginBottom: 6 }}>Insert variable:</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {activeDef.variables.map((v) => (
                  <button
                    key={v}
                    onClick={() => insertVariable(v)}
                    style={{
                      background: "#f1f5f9",
                      border: `1px solid ${DESIGN.border}`,
                      borderRadius: 4,
                      padding: "3px 8px",
                      fontSize: 11,
                      cursor: "pointer",
                      color: DESIGN.brand,
                      fontFamily: "monospace",
                    }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: DESIGN.brand,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}>
              {saving ? "Saving…" : "Save template"}
            </button>
            {message && (
              <span style={{ fontSize: 13, color: message === "Template saved." ? "#16a34a" : "#dc2626" }}>
                {message}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
