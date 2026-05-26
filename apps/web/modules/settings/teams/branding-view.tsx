"use client";

import { useEffect, useRef, useState } from "react";

const DESIGN = {
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  brand: "#6366f1",
  text: "#0f172a",
  muted: "#64748b",
};

interface BrandingViewProps {
  teamId: number;
}

interface BrandingData {
  brandLogo?: string;
  brandColor?: string;
  brandName?: string;
  hidePagerScheduleBranding: boolean;
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: DESIGN.card,
        border: `1px solid ${DESIGN.border}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
      }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 4px" }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 13, color: DESIGN.muted, margin: "0 0 16px" }}>{description}</p>
      )}
      {children}
    </div>
  );
}

export default function BrandingView({ teamId }: BrandingViewProps) {
  const [data, setData] = useState<BrandingData>({
    brandColor: "#6366f1",
    hidePagerScheduleBranding: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/branding`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => null);
  }, [teamId]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/teams/${teamId}/branding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to save");
      } else {
        setSaved(true);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      setError("Only PNG, JPG, and SVG files are allowed");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("teamId", String(teamId));
    const res = await fetch("/api/teams/upload-logo", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setData((d) => ({ ...d, brandLogo: url }));
    } else {
      setError("Logo upload failed");
    }
  };

  return (
    <div style={{ background: DESIGN.bg }}>
      {/* Logo upload */}
      <Card title="Team logo" description="Upload your logo. Minimum 200×50px. PNG, SVG, or JPG.">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {data.brandLogo ? (
            <img
              src={data.brandLogo}
              alt="Team logo"
              style={{ height: 50, maxWidth: 200, objectFit: "contain", border: `1px solid ${DESIGN.border}`, borderRadius: 8, padding: 4 }}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 50,
                border: `2px dashed ${DESIGN.border}`,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: DESIGN.muted,
                fontSize: 13,
              }}>
              No logo uploaded
            </div>
          )}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: DESIGN.brand,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 14,
                cursor: "pointer",
              }}>
              Upload logo
            </button>
            {data.brandLogo && (
              <button
                onClick={() => setData((d) => ({ ...d, brandLogo: undefined }))}
                style={{
                  marginLeft: 8,
                  background: "transparent",
                  color: "#dc2626",
                  border: `1px solid #fecaca`,
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                Remove
              </button>
            )}
            <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.svg" onChange={handleLogoUpload} style={{ display: "none" }} />
          </div>
        </div>
      </Card>

      {/* Brand color */}
      <Card title="Brand color" description="Primary color applied to buttons and links on your booking pages.">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="color"
            value={data.brandColor ?? "#6366f1"}
            onChange={(e) => setData((d) => ({ ...d, brandColor: e.target.value }))}
            style={{ width: 44, height: 44, border: "none", borderRadius: 8, cursor: "pointer", padding: 2 }}
          />
          <input
            type="text"
            value={data.brandColor ?? "#6366f1"}
            onChange={(e) => setData((d) => ({ ...d, brandColor: e.target.value }))}
            maxLength={7}
            style={{
              padding: "8px 12px",
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 8,
              fontSize: 14,
              width: 110,
              fontFamily: "monospace",
            }}
          />
          <div
            style={{
              padding: "8px 20px",
              background: data.brandColor ?? "#6366f1",
              color: "#fff",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
            }}>
            Preview button
          </div>
          <button
            onClick={() => setData((d) => ({ ...d, brandColor: "#6366f1" }))}
            style={{
              background: "transparent",
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: DESIGN.muted,
              cursor: "pointer",
            }}>
            Reset
          </button>
        </div>
      </Card>

      {/* Brand name */}
      <Card title="Brand name" description="The name shown on your booking pages instead of your team name.">
        <input
          type="text"
          placeholder="Your company name"
          value={data.brandName ?? ""}
          onChange={(e) => setData((d) => ({ ...d, brandName: e.target.value }))}
          style={{
            width: "100%",
            maxWidth: 400,
            padding: "8px 12px",
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 8,
            fontSize: 14,
          }}
        />
      </Card>

      {/* Hide branding */}
      <Card
        title="Hide PagerSchedule branding"
        description="Remove all 'Powered by PagerSchedule' text from your booking pages and emails.">
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.hidePagerScheduleBranding}
            onChange={(e) => setData((d) => ({ ...d, hidePagerScheduleBranding: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: DESIGN.brand }}
          />
          <span style={{ fontSize: 14, color: DESIGN.text }}>
            Hide "Powered by PagerSchedule" on booking pages and emails
          </span>
        </label>
        <p style={{ fontSize: 12, color: DESIGN.muted, marginTop: 8, marginLeft: 30 }}>
          Available on Team and Enterprise plans.
        </p>
      </Card>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? "#e2e8f0" : DESIGN.brand,
            color: saving ? DESIGN.muted : "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 15,
            fontWeight: 500,
            cursor: saving ? "not-allowed" : "pointer",
          }}>
          {saving ? "Saving…" : "Save branding"}
        </button>
        {saved && <span style={{ color: "#16a34a", fontSize: 14 }}>✓ Saved</span>}
        {error && <span style={{ color: "#dc2626", fontSize: 14 }}>{error}</span>}
      </div>
    </div>
  );
}
