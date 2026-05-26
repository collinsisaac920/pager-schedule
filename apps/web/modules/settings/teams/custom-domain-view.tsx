"use client";

import { useState } from "react";

const DESIGN = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  brand: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
};

interface CustomDomainViewProps {
  teamId: number;
}

type VerifyStatus = "idle" | "loading" | "verified" | "failed";

export default function CustomDomainView({ teamId }: CustomDomainViewProps) {
  const [domain, setDomain] = useState("");
  const [saved, setSaved] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSave = async () => {
    setSaved(false);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/teams/${teamId}/custom-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customDomain: domain }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error ?? "Failed to save domain");
        return;
      }
      setSaved(true);
    } catch {
      setErrorMessage("Network error — please try again");
    }
  };

  const handleVerify = async () => {
    setVerifyStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/teams/${teamId}/verify-domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setVerifyStatus(data.verified ? "verified" : "failed");
      if (!data.verified) setErrorMessage(data.message ?? "DNS record not found yet");
    } catch {
      setVerifyStatus("failed");
      setErrorMessage("Verification request failed");
    }
  };

  const statusBadge = () => {
    if (verifyStatus === "verified")
      return (
        <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 600 }}>✓ Verified</span>
      );
    if (verifyStatus === "failed")
      return <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 600 }}>✗ Not verified</span>;
    return <span style={{ color: DESIGN.muted, fontSize: 13 }}>Pending verification</span>;
  };

  return (
    <div style={{ background: DESIGN.bg, minHeight: "100%" }}>
      {/* Domain input card */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 4px" }}>
          Custom domain
        </h3>
        <p style={{ fontSize: 13, color: DESIGN.muted, margin: "0 0 16px" }}>
          Enter the custom domain you want to use for your team's booking pages.
        </p>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="booking.yourcompany.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "DM Sans, sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={handleSave}
            style={{
              background: DESIGN.brand,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}>
            Save
          </button>
        </div>

        {saved && (
          <p style={{ color: "#16a34a", fontSize: 13, marginTop: 8 }}>
            Domain saved. Now verify the DNS record below.
          </p>
        )}
        {errorMessage && (
          <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{errorMessage}</p>
        )}
      </div>

      {/* DNS instructions card */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 20,
        }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 4px" }}>
          DNS configuration
        </h3>
        <p style={{ fontSize: 13, color: DESIGN.muted, margin: "0 0 16px" }}>
          Add this CNAME record to your DNS provider (e.g. Cloudflare, Route 53, Namecheap):
        </p>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "monospace",
            fontSize: 13,
          }}>
          <thead>
            <tr>
              {["Type", "Name", "Value", "TTL"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "6px 12px",
                    background: "#f1f5f9",
                    border: `1px solid ${DESIGN.border}`,
                    color: DESIGN.text,
                    fontWeight: 600,
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {["CNAME", "booking", "cname.pagerschedule.com", "3600"].map((v) => (
                <td
                  key={v}
                  style={{
                    padding: "6px 12px",
                    border: `1px solid ${DESIGN.border}`,
                    color: DESIGN.text,
                  }}>
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <p style={{ fontSize: 12, color: DESIGN.muted, marginTop: 12 }}>
          DNS changes can take up to 24–48 hours to propagate globally.
        </p>
      </div>

      {/* Verification card */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          padding: 24,
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 4px" }}>
              Verification status
            </h3>
            {statusBadge()}
          </div>
          <button
            onClick={handleVerify}
            disabled={!domain || verifyStatus === "loading"}
            style={{
              background: verifyStatus === "loading" ? "#e2e8f0" : DESIGN.brand,
              color: verifyStatus === "loading" ? DESIGN.muted : "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: domain && verifyStatus !== "loading" ? "pointer" : "not-allowed",
            }}>
            {verifyStatus === "loading" ? "Checking…" : "Verify domain"}
          </button>
        </div>
      </div>
    </div>
  );
}
