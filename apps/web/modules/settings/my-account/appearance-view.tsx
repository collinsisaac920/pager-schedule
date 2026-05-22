"use client";

import { useState } from "react";

import { useTheme } from "@lib/theme-context";
import type { Theme } from "@lib/theme";
import type { RouterOutputs } from "@calcom/trpc/react";

// ── Types ───────────────────────────────────────────────────────────────────

type ColorKey = keyof Theme;

interface ColorRow {
  key: ColorKey;
  label: string;
  description: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const COLOR_ROWS: ColorRow[] = [
  { key: "pageBg",       label: "Page background",  description: "The main content area background" },
  { key: "sidebarBg",   label: "Sidebar",           description: "Dashboard sidebar background" },
  { key: "cardBg",      label: "Card background",   description: "Surfaces and panels" },
  { key: "brandPrimary",label: "Brand color",       description: "Buttons, links, and highlights" },
  { key: "brandAccent", label: "Accent color",      description: "Secondary calls-to-action" },
  { key: "inkColor",    label: "Headings",          description: "Primary text color" },
  { key: "successColor",label: "Success color",     description: "Confirmations and positive states" },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 24,
      }}>
      <div style={{ marginBottom: description ? 6 : 20 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#111827",
            fontFamily: "'DM Sans', -apple-system, sans-serif",
          }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: 13.5, color: "#9ca3af", marginTop: 4, marginBottom: 20 }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ColorPickerRow({
  row,
  value,
  onChange,
  onReset,
  defaultValue,
}: {
  row: ColorRow;
  value: string;
  onChange: (v: string) => void;
  onReset: () => void;
  defaultValue: string;
}) {
  const [hex, setHex] = useState(value);

  const commit = (v: string) => {
    const clean = v.startsWith("#") ? v : `#${v}`;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      setHex(clean);
      onChange(clean);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHex(e.target.value);
    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
      onChange(e.target.value);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f1f5f9",
        gap: 16,
      }}>
      {/* Color swatch + native picker */}
      <label style={{ cursor: "pointer", flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: value,
            border: "2px solid #e2e8f0",
            cursor: "pointer",
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => { setHex(e.target.value); onChange(e.target.value); }}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
      </label>

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{row.label}</div>
        <div style={{ fontSize: 12.5, color: "#9ca3af" }}>{row.description}</div>
      </div>

      {/* Hex text input */}
      <input
        type="text"
        value={hex}
        onChange={handleTextChange}
        onBlur={(e) => commit(e.target.value)}
        maxLength={7}
        style={{
          width: 90,
          padding: "6px 10px",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "monospace",
          color: "#111827",
          outline: "none",
        }}
      />

      {/* Reset button */}
      <button
        type="button"
        onClick={() => { setHex(defaultValue); onReset(); }}
        disabled={value === defaultValue}
        style={{
          fontSize: 12,
          color: value === defaultValue ? "#d1d5db" : "#6366f1",
          background: "none",
          border: "none",
          cursor: value === defaultValue ? "default" : "pointer",
          padding: "4px 8px",
          borderRadius: 6,
          fontWeight: 500,
          flexShrink: 0,
        }}>
        Reset
      </button>
    </div>
  );
}

function LivePreview({ pending }: { pending: Theme }) {
  return (
    <div
      style={{
        background: pending.pageBg,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${pending.border}`,
        display: "flex",
        height: 200,
      }}>
      {/* Mini sidebar */}
      <div
        style={{
          width: 120,
          background: pending.sidebarBg,
          borderRight: `1px solid ${pending.border}`,
          padding: "14px 12px",
          flexShrink: 0,
        }}>
        <div
          style={{
            width: 32,
            height: 8,
            borderRadius: 4,
            background: pending.brandPrimary,
            marginBottom: 16,
          }}
        />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 22,
              borderRadius: 6,
              background: i === 1 ? `${pending.brandPrimary}22` : "transparent",
              display: "flex",
              alignItems: "center",
              padding: "0 6px",
              marginBottom: 4,
            }}>
            <div
              style={{
                width: i === 1 ? 52 : 40,
                height: 6,
                borderRadius: 3,
                background: i === 1 ? pending.brandPrimary : pending.mutedColor,
              }}
            />
          </div>
        ))}
      </div>

      {/* Mini content */}
      <div style={{ flex: 1, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div
            style={{
              width: 80,
              height: 10,
              borderRadius: 4,
              background: pending.inkColor,
            }}
          />
          <div
            style={{
              width: 60,
              height: 26,
              borderRadius: 8,
              background: pending.brandPrimary,
            }}
          />
        </div>
        {/* Cards */}
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: pending.cardBg,
              border: `1px solid ${pending.border}`,
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 8,
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: i === 1 ? `${pending.brandPrimary}22` : `${pending.successColor}22`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: 80,
                  height: 7,
                  borderRadius: 3,
                  background: pending.inkColor,
                  marginBottom: 5,
                }}
              />
              <div
                style={{
                  width: 110,
                  height: 6,
                  borderRadius: 3,
                  background: pending.mutedColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const AppearancePage = ({
  user: _user,
  hasPaidPlan: _hasPaidPlan,
}: {
  user: RouterOutputs["viewer"]["me"]["get"];
  hasPaidPlan: boolean;
}) => {
  const { theme, updateTheme, resetTheme, hasCustomTheme } = useTheme();
  const [pending, setPending] = useState<Theme>({ ...theme });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isDirty = JSON.stringify(pending) !== JSON.stringify(theme);

  const updatePending = (key: ColorKey, value: string) => {
    setPending((p) => ({ ...p, [key]: value }));
  };

  const handleSave = () => {
    // Apply each changed key
    const updates: Partial<Theme> = {};
    for (const key of Object.keys(pending) as ColorKey[]) {
      if (pending[key] !== theme[key]) {
        (updates as Record<string, string>)[key] = pending[key];
      }
    }
    if (Object.keys(updates).length > 0) {
      updateTheme(updates);
    }
    setSaved(true);
    window.dispatchEvent(new Event("pager:settings-saved"));
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetTheme();
    // Import THEME_DEFAULTS inline to reset pending
    import("@lib/theme").then(({ THEME_DEFAULTS }) => {
      setPending({ ...THEME_DEFAULTS });
    });
    setShowResetConfirm(false);
    setSaved(false);
  };

  return (
    <div style={{ maxWidth: 720, paddingBottom: 60 }}>
      {/* Brand colors card */}
      <Card
        title="Brand & colors"
        description="Customize the color palette across your Pager Schedule dashboard.">
        <div>
          {COLOR_ROWS.map((row) => {
            const defaultVal = getDefaultValue(row.key);
            return (
              <ColorPickerRow
                key={row.key}
                row={row}
                value={pending[row.key]}
                defaultValue={defaultVal}
                onChange={(v) => updatePending(row.key, v)}
                onReset={() => updatePending(row.key, defaultVal)}
              />
            );
          })}
        </div>
      </Card>

      {/* Live preview card */}
      <Card title="Live preview" description="See how your color choices look in the dashboard.">
        <LivePreview pending={pending} />
      </Card>

      {/* Actions card */}
      <Card title="Save changes">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            style={{
              height: 40,
              padding: "0 24px",
              borderRadius: 10,
              background: isDirty ? "#6366f1" : "#e2e8f0",
              color: isDirty ? "#ffffff" : "#9ca3af",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: isDirty ? "pointer" : "default",
              transition: "all .15s",
            }}>
            {saved ? "Saved ✓" : "Save changes"}
          </button>

          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={!hasCustomTheme}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 10,
                background: "none",
                color: hasCustomTheme ? "#ef4444" : "#d1d5db",
                border: `1.5px solid ${hasCustomTheme ? "#fca5a5" : "#e5e7eb"}`,
                fontSize: 14,
                fontWeight: 500,
                cursor: hasCustomTheme ? "pointer" : "default",
              }}>
              Reset to defaults
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13.5, color: "#6b7280" }}>Reset all colors?</span>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 8,
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 8,
                  background: "none",
                  color: "#6b7280",
                  border: "1px solid #e2e8f0",
                  fontSize: 13.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}>
                Cancel
              </button>
            </div>
          )}
        </div>
        {!hasCustomTheme && (
          <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>
            You&apos;re using the default Pager Schedule color scheme.
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper to get the THEME_DEFAULTS value synchronously for reset buttons.
// We duplicate the defaults here to avoid a dynamic import in render.
const DEFAULTS: Theme = {
  pageBg:       "#f8fafc",
  sidebarBg:    "#ffffff",
  cardBg:       "#ffffff",
  border:       "#e2e8f0",
  brandPrimary: "#6366f1",
  brandSoft:    "#f0effe",
  brandAccent:  "#0069ff",
  successColor: "#00c48c",
  inkColor:     "#111827",
  slateColor:   "#4b5563",
  mutedColor:   "#9ca3af",
};

function getDefaultValue(key: ColorKey): string {
  return DEFAULTS[key];
}

export default AppearancePage;
