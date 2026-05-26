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

interface ExportJob {
  id: string;
  format: string;
  dataType: string;
  status: string;
  recordCount: number | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

interface DataExportViewProps {
  teamId: number;
}

export default function DataExportView({ teamId }: DataExportViewProps) {
  const [format, setFormat] = useState<"json" | "csv">("csv");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const fetchHistory = async () => {
    const res = await fetch(`/api/teams/${teamId}/export-history`);
    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs ?? []);
    }
    setLoadingJobs(false);
  };

  useEffect(() => { fetchHistory(); }, [teamId]);

  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams({ teamId: String(teamId), format });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const url = `/api/export/bookings?${params.toString()}`;

    if (format === "csv") {
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `bookings-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    }
    setExporting(false);
    setTimeout(fetchHistory, 1500);
  };

  return (
    <div style={{ background: DESIGN.bg, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Export form */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 16px" }}>
          Export Bookings
        </h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: DESIGN.muted }}>Format</span>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as "json" | "csv")}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
                minWidth: 120,
              }}>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: DESIGN.muted }}>From date</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: DESIGN.muted }}>To date</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            />
          </label>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              background: DESIGN.brand,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 14,
              fontWeight: 500,
              cursor: exporting ? "not-allowed" : "pointer",
              opacity: exporting ? 0.7 : 1,
            }}>
            {exporting ? "Exporting…" : `Export ${format.toUpperCase()}`}
          </button>
        </div>
        <p style={{ fontSize: 12, color: DESIGN.muted, marginTop: 12 }}>
          Exports up to 5,000 most recent bookings. Leave dates blank to export all.
        </p>
      </div>

      {/* History */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DESIGN.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: 0 }}>
            Export History
          </h3>
        </div>
        {loadingJobs ? (
          <div style={{ padding: 24, color: DESIGN.muted, fontSize: 14 }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 24, color: DESIGN.muted, fontSize: 14 }}>No exports yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date", "By", "Format", "Rows", "Status"].map((h) => (
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
              {jobs.map((job, i) => (
                <tr key={job.id} style={{ borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: DESIGN.text }}>
                    {new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: DESIGN.muted }}>
                    {job.user?.name ?? job.user?.email ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: job.format === "csv" ? "#0891b2" : "#7c3aed",
                        background: job.format === "csv" ? "#0891b215" : "#7c3aed15",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}>
                      {job.format.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: DESIGN.text }}>
                    {job.recordCount ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: job.status === "COMPLETED" ? "#16a34a" : DESIGN.muted,
                        fontWeight: 500,
                      }}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
