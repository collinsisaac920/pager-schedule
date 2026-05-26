"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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

interface DailySeries {
  date: string;
  count: number;
}

interface ByEventType {
  title: string;
  count: number;
  totalMin: number;
}

interface ByMember {
  id: number;
  name: string | null;
  count: number;
}

interface AnalyticsData {
  total: number;
  confirmed: number;
  cancelled: number;
  dailySeries: DailySeries[];
  byEventType: ByEventType[];
  byMember: ByMember[];
  days: number;
}

interface TeamAnalyticsViewProps {
  teamId: number;
}

const STAT_CARDS = (data: AnalyticsData) => [
  { label: "Total Bookings", value: data.total, color: DESIGN.brand },
  { label: "Confirmed", value: data.confirmed, color: "#16a34a" },
  { label: "Cancelled", value: data.cancelled, color: "#dc2626" },
  {
    label: "Completion Rate",
    value: data.total > 0 ? `${Math.round((data.confirmed / data.total) * 100)}%` : "—",
    color: "#0891b2",
  },
];

export default function TeamAnalyticsView({ teamId }: TeamAnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchData = (d: number) => {
    setLoading(true);
    fetch(`/api/teams/${teamId}/analytics?days=${d}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(days); }, [teamId, days]);

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  };

  // Show every nth label to avoid crowding
  const tickInterval = days <= 7 ? 0 : days <= 30 ? 4 : 9;

  return (
    <div style={{ background: DESIGN.bg, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            style={{
              padding: "6px 14px",
              border: `1px solid ${days === d ? DESIGN.brand : DESIGN.border}`,
              borderRadius: 8,
              background: days === d ? DESIGN.brand : "#fff",
              color: days === d ? "#fff" : DESIGN.text,
              fontSize: 13,
              fontWeight: days === d ? 600 : 400,
              cursor: "pointer",
            }}>
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: DESIGN.muted, padding: 24 }}>Loading…</div>
      ) : !data ? (
        <div style={{ color: "#dc2626", padding: 24 }}>Failed to load analytics.</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {STAT_CARDS(data).map((s) => (
              <div
                key={s.label}
                style={{
                  background: DESIGN.card,
                  border: `1px solid ${DESIGN.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: DESIGN.muted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Daily line chart */}
          <div
            style={{
              background: DESIGN.card,
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 12,
              padding: 24,
            }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 20px" }}>
              Bookings Over Time
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailySeries} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={DESIGN.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: DESIGN.muted }}
                  tickFormatter={formatDate}
                  interval={tickInterval}
                />
                <YAxis tick={{ fontSize: 11, fill: DESIGN.muted }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: number) => [v, "Bookings"]}
                  labelFormatter={formatDate}
                  contentStyle={{ fontSize: 12, border: `1px solid ${DESIGN.border}` }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={DESIGN.brand}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event types bar chart */}
          {data.byEventType.length > 0 && (
            <div
              style={{
                background: DESIGN.card,
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 12,
                padding: 24,
              }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 20px" }}>
                Bookings by Event Type
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.byEventType} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={DESIGN.border} />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 11, fill: DESIGN.muted }}
                    interval={0}
                    tickFormatter={(v: string) => (v.length > 14 ? v.slice(0, 14) + "…" : v)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: DESIGN.muted }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [v, "Bookings"]}
                    contentStyle={{ fontSize: 12, border: `1px solid ${DESIGN.border}` }}
                  />
                  <Bar dataKey="count" fill={DESIGN.brand} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Team performance table */}
          {data.byMember.length > 0 && (
            <div
              style={{
                background: DESIGN.card,
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DESIGN.border}` }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: 0 }}>
                  Team Performance
                </h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Rank", "Member", "Bookings", "Share"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "10px 16px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: DESIGN.muted,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byMember.map((m, i) => {
                    const share = data.total > 0 ? Math.round((m.count / data.total) * 100) : 0;
                    return (
                      <tr
                        key={m.id}
                        style={{ borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: DESIGN.muted }}>
                          #{i + 1}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: DESIGN.text }}>
                          {m.name ?? "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: DESIGN.brand }}>
                          {m.count}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                height: 6,
                                width: 80,
                                background: DESIGN.border,
                                borderRadius: 3,
                                overflow: "hidden",
                              }}>
                              <div
                                style={{
                                  height: "100%",
                                  width: `${share}%`,
                                  background: DESIGN.brand,
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 12, color: DESIGN.muted }}>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data.total === 0 && (
            <div
              style={{
                background: DESIGN.card,
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                color: DESIGN.muted,
                fontSize: 14,
              }}>
              No bookings in the selected period.
            </div>
          )}
        </>
      )}
    </div>
  );
}
