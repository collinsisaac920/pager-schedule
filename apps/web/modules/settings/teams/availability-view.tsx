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

const SCHEDULING_TYPES = [
  {
    value: "ROUND_ROBIN",
    label: "Round Robin",
    description: "Distribute bookings evenly across all team members in rotation.",
  },
  {
    value: "COLLECTIVE",
    label: "Collective",
    description: "All team members must be available — booking requires everyone free.",
  },
  {
    value: "MANAGED",
    label: "Managed",
    description: "Event types are managed centrally and pushed to individual members.",
  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_KEYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface DayHours {
  enabled: boolean;
  start: string;
  end: string;
}

type WorkingHours = Record<string, DayHours>;

const DEFAULT_HOURS: WorkingHours = {
  MON: { enabled: true, start: "09:00", end: "17:00" },
  TUE: { enabled: true, start: "09:00", end: "17:00" },
  WED: { enabled: true, start: "09:00", end: "17:00" },
  THU: { enabled: true, start: "09:00", end: "17:00" },
  FRI: { enabled: true, start: "09:00", end: "17:00" },
  SAT: { enabled: false, start: "09:00", end: "17:00" },
  SUN: { enabled: false, start: "09:00", end: "17:00" },
};

interface TeamAvailabilityViewProps {
  teamId: number;
}

export default function TeamAvailabilityView({ teamId }: TeamAvailabilityViewProps) {
  const [schedulingType, setSchedulingType] = useState("ROUND_ROBIN");
  const [workingHours, setWorkingHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/availability`)
      .then((r) => r.json())
      .then((data) => {
        if (data.schedulingType) setSchedulingType(data.schedulingType);
        if (data.workingHours) setWorkingHours(data.workingHours);
        if (data.bufferBefore != null) setBufferBefore(data.bufferBefore);
        if (data.bufferAfter != null) setBufferAfter(data.bufferAfter);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/teams/${teamId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedulingType, workingHours, bufferBefore, bufferAfter }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Settings saved." : data.error ?? "Failed to save.");
    setSaving(false);
  };

  const toggleDay = (key: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const updateTime = (key: string, field: "start" | "end", value: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  if (loading) return <div style={{ color: DESIGN.muted, padding: 24 }}>Loading…</div>;

  return (
    <div style={{ background: DESIGN.bg, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Scheduling Type */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 16px" }}>
          Scheduling Algorithm
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SCHEDULING_TYPES.map((st) => (
            <label
              key={st.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                border: `2px solid ${schedulingType === st.value ? DESIGN.brand : DESIGN.border}`,
                borderRadius: 10,
                cursor: "pointer",
                background: schedulingType === st.value ? `${DESIGN.brand}08` : "#fff",
                transition: "border-color 0.15s",
              }}>
              <input
                type="radio"
                name="schedulingType"
                value={st.value}
                checked={schedulingType === st.value}
                onChange={() => setSchedulingType(st.value)}
                style={{ marginTop: 2, accentColor: DESIGN.brand }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: DESIGN.text }}>{st.label}</div>
                <div style={{ fontSize: 13, color: DESIGN.muted, marginTop: 2 }}>{st.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Working Hours */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 16px" }}>
          Team Working Hours
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {DAY_KEYS.map((key, i) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 0",
                borderBottom: i < DAY_KEYS.length - 1 ? `1px solid ${DESIGN.border}` : undefined,
              }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: 120,
                  cursor: "pointer",
                }}>
                <input
                  type="checkbox"
                  checked={workingHours[key].enabled}
                  onChange={() => toggleDay(key)}
                  style={{ accentColor: DESIGN.brand }}
                />
                <span style={{ fontSize: 14, color: DESIGN.text, fontWeight: 500 }}>
                  {DAYS[i]}
                </span>
              </label>
              {workingHours[key].enabled ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="time"
                    value={workingHours[key].start}
                    onChange={(e) => updateTime(key, "start", e.target.value)}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${DESIGN.border}`,
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                  <span style={{ color: DESIGN.muted, fontSize: 13 }}>to</span>
                  <input
                    type="time"
                    value={workingHours[key].end}
                    onChange={(e) => updateTime(key, "end", e.target.value)}
                    style={{
                      padding: "6px 10px",
                      border: `1px solid ${DESIGN.border}`,
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                </div>
              ) : (
                <span style={{ fontSize: 13, color: DESIGN.muted }}>Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buffer Times */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 16px" }}>
          Buffer Between Bookings
        </h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: DESIGN.muted }}>Before event</span>
            <select
              value={bufferBefore}
              onChange={(e) => setBufferBefore(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
                minWidth: 160,
              }}>
              {[0, 5, 10, 15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "No buffer" : `${m} minutes`}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: DESIGN.muted }}>After event</span>
            <select
              value={bufferAfter}
              onChange={(e) => setBufferAfter(Number(e.target.value))}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
                minWidth: 160,
              }}>
              {[0, 5, 10, 15, 30, 45, 60].map((m) => (
                <option key={m} value={m}>
                  {m === 0 ? "No buffer" : `${m} minutes`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Save */}
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
          {saving ? "Saving…" : "Save settings"}
        </button>
        {message && (
          <span style={{ fontSize: 13, color: message === "Settings saved." ? "#16a34a" : "#dc2626" }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
