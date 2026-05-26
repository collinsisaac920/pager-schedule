"use client";

import { useRef, useState } from "react";

const DESIGN = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  brand: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
};

interface ParsedRow {
  email: string;
  role: string;
  valid: boolean;
  error?: string;
}

interface InviteResult {
  email: string;
  status: "invited" | "already_member" | "error";
  message?: string;
}

interface BulkInviteViewProps {
  teamId: number;
}

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split("\n");
  const rows: ParsedRow[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase().startsWith("email")) continue;
    const [rawEmail, rawRole] = trimmed.split(",").map((s) => s.trim());
    const email = rawEmail?.toLowerCase() ?? "";
    const role = ["OWNER", "ADMIN", "MEMBER", "VIEWER"].includes((rawRole ?? "").toUpperCase())
      ? rawRole.toUpperCase()
      : "MEMBER";
    const valid = Boolean(email && email.includes("@") && email.includes("."));
    rows.push({ email, role, valid, error: valid ? undefined : "Invalid email" });
  }
  return rows;
}

export default function BulkInviteView({ teamId }: BulkInviteViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [manualText, setManualText] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<InviteResult[] | null>(null);
  const [summary, setSummary] = useState<{ invited: number; skipped: number; errors: number } | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRows(parseCSV(text));
      setManualText("");
    };
    reader.readAsText(file);
  };

  const handleManualParse = () => {
    setRows(parseCSV(manualText));
  };

  const handleSend = async () => {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    setSending(true);
    setResults(null);
    setSummary(null);

    const res = await fetch(`/api/teams/${teamId}/members/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invites: validRows.map((r) => ({ email: r.email, role: r.role })) }),
    });
    const data = await res.json();
    if (res.ok) {
      setResults(data.results);
      setSummary(data.summary);
      setRows([]);
      setManualText("");
    }
    setSending(false);
  };

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.filter((r) => !r.valid).length;

  return (
    <div style={{ background: DESIGN.bg, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Upload or paste */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 4px" }}>
          Import Invites
        </h3>
        <p style={{ fontSize: 13, color: DESIGN.muted, margin: "0 0 16px" }}>
          Upload a CSV file or paste emails below. Format: <code>email,role</code> (role optional, defaults to MEMBER).
        </p>

        {/* CSV upload */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              background: "#f1f5f9",
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer",
              color: DESIGN.text,
            }}>
            Upload CSV
          </button>
          <span style={{ fontSize: 12, color: DESIGN.muted }}>or paste below</span>
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={handleFile} />
        </div>

        {/* Manual input */}
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder={"email,role\njane@company.com,ADMIN\nbob@company.com\nalice@company.com,MEMBER"}
            rows={6}
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
          <button
            onClick={handleManualParse}
            disabled={!manualText.trim()}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: `1px solid ${DESIGN.brand}`,
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              cursor: manualText.trim() ? "pointer" : "not-allowed",
              color: DESIGN.brand,
              opacity: manualText.trim() ? 1 : 0.5,
            }}>
            Parse
          </button>
        </div>
      </div>

      {/* Preview table */}
      {rows.length > 0 && (
        <div
          style={{
            background: DESIGN.card,
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}>
          <div
            style={{
              padding: "14px 24px",
              borderBottom: `1px solid ${DESIGN.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text }}>
                Preview ({rows.length} rows)
              </span>
              {invalidCount > 0 && (
                <span style={{ fontSize: 12, color: "#dc2626", marginLeft: 8 }}>
                  {invalidCount} invalid
                </span>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={sending || validCount === 0}
              style={{
                background: DESIGN.brand,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                cursor: sending || validCount === 0 ? "not-allowed" : "pointer",
                opacity: sending || validCount === 0 ? 0.6 : 1,
              }}>
              {sending ? "Sending…" : `Send ${validCount} invite${validCount !== 1 ? "s" : ""}`}
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Email", "Role", ""].map((h, idx) => (
                  <th
                    key={idx}
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
              {rows.map((row, i) => (
                <tr key={i} style={{ borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined }}>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: row.valid ? DESIGN.text : "#dc2626" }}>
                    {row.email || "—"}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 13, color: DESIGN.muted }}>
                    {row.role}
                  </td>
                  <td style={{ padding: "10px 16px", fontSize: 12 }}>
                    {row.valid ? (
                      <span style={{ color: "#16a34a" }}>✓</span>
                    ) : (
                      <span style={{ color: "#dc2626" }}>{row.error}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results */}
      {summary && results && (
        <div
          style={{
            background: DESIGN.card,
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 12,
            padding: 20,
          }}>
          <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Invited", value: summary.invited, color: "#16a34a" },
              { label: "Already member", value: summary.skipped, color: DESIGN.muted },
              { label: "Errors", value: summary.errors, color: "#dc2626" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: DESIGN.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          {results.filter((r) => r.status === "error").length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DESIGN.text, marginBottom: 6 }}>
                Errors:
              </div>
              {results
                .filter((r) => r.status === "error")
                .map((r) => (
                  <div key={r.email} style={{ fontSize: 13, color: "#dc2626" }}>
                    {r.email}: {r.message}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
