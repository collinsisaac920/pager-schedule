"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DESIGN = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  brand: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#64748b",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#7c2d12",
};

interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  createdAt: string;
  resolvedAt: string | null;
}

interface StatusData {
  isUp: boolean;
  uptimePct: number;
  sla: string;
  avgLatency: number;
  total: number;
  dailySeries: { date: string; uptime: number; checks: number }[];
  incidents: Incident[];
  lastChecked: string | null;
}

export default function StatusPageContent() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/uptime/status?days=90")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: DESIGN.bg,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: "40px 24px",
      }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: DESIGN.text, margin: 0 }}>
            PagerSchedule Status
          </h1>
          <p style={{ color: DESIGN.muted, marginTop: 6, fontSize: 14 }}>
            Live system status and uptime information
          </p>
        </div>

        {loading ? (
          <div style={{ color: DESIGN.muted }}>Loading…</div>
        ) : !data ? (
          <div style={{ color: "#dc2626" }}>Unable to load status.</div>
        ) : (
          <>
            {/* Overall status banner */}
            <div
              style={{
                background: data.isUp ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${data.isUp ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: data.isUp ? "#16a34a" : "#dc2626",
                  flexShrink: 0,
                  boxShadow: data.isUp
                    ? "0 0 0 4px #bbf7d040"
                    : "0 0 0 4px #fecaca40",
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: data.isUp ? "#15803d" : "#dc2626" }}>
                  {data.isUp ? "All Systems Operational" : "Service Disruption Detected"}
                </div>
                {data.lastChecked && (
                  <div style={{ fontSize: 12, color: DESIGN.muted, marginTop: 2 }}>
                    Last checked {new Date(data.lastChecked).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* SLA stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}>
              {[
                { label: "90-day Uptime", value: `${data.uptimePct}%` },
                { label: "SLA Tier", value: data.sla },
                { label: "Avg Latency", value: `${data.avgLatency}ms` },
                { label: "Checks Run", value: data.total.toLocaleString() },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: DESIGN.card,
                    border: `1px solid ${DESIGN.border}`,
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: DESIGN.brand }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: DESIGN.muted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Uptime area chart */}
            {data.dailySeries.length > 0 && (
              <div
                style={{
                  background: DESIGN.card,
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 24,
                }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 20px" }}>
                  Uptime (90 days)
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.dailySeries} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                    <defs>
                      <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={DESIGN.border} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: DESIGN.muted }}
                      tickFormatter={formatDate}
                      interval={9}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: DESIGN.muted }}
                      domain={[95, 100]}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, "Uptime"]}
                      labelFormatter={formatDate}
                      contentStyle={{ fontSize: 12, border: `1px solid ${DESIGN.border}` }}
                    />
                    <Area
                      type="monotone"
                      dataKey="uptime"
                      stroke="#16a34a"
                      strokeWidth={2}
                      fill="url(#uptimeGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Incidents */}
            <div
              style={{
                background: DESIGN.card,
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DESIGN.border}` }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: 0 }}>
                  Incident History
                </h2>
              </div>
              {data.incidents.length === 0 ? (
                <div style={{ padding: 24, color: DESIGN.muted, fontSize: 14 }}>
                  No incidents in the last 90 days.
                </div>
              ) : (
                data.incidents.map((inc, i) => (
                  <div
                    key={inc.id}
                    style={{
                      padding: "16px 24px",
                      borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                    }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: inc.resolvedAt ? "#16a34a" : SEVERITY_COLORS[inc.severity] ?? "#64748b",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: DESIGN.text }}>
                          {inc.title}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: SEVERITY_COLORS[inc.severity] ?? DESIGN.muted,
                            background: `${SEVERITY_COLORS[inc.severity] ?? DESIGN.muted}15`,
                            padding: "1px 7px",
                            borderRadius: 4,
                            fontWeight: 500,
                          }}>
                          {inc.severity}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: inc.resolvedAt ? "#16a34a" : "#f59e0b",
                            fontWeight: 500,
                          }}>
                          {inc.resolvedAt ? "Resolved" : "Active"}
                        </span>
                      </div>
                      {inc.description && (
                        <div style={{ fontSize: 13, color: DESIGN.muted, marginTop: 2 }}>
                          {inc.description}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: DESIGN.muted, marginTop: 4 }}>
                        Started {new Date(inc.createdAt).toLocaleString()}
                        {inc.resolvedAt &&
                          ` · Resolved ${new Date(inc.resolvedAt).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
