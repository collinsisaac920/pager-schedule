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

const SCHEDULING_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ROUND_ROBIN: { label: "Round Robin", color: "#2563eb" },
  COLLECTIVE: { label: "Collective", color: "#7c3aed" },
  MANAGED: { label: "Managed", color: "#0891b2" },
};

interface EventTypeItem {
  id: number;
  title: string;
  slug: string;
  length: number;
  schedulingType: string | null;
  hidden: boolean;
  description: string | null;
  bookingCount: number;
  link: string;
}

interface TeamEventTypesViewProps {
  teamId: number;
}

export default function TeamEventTypesView({ teamId }: TeamEventTypesViewProps) {
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [teamSlug, setTeamSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/event-types`)
      .then((r) => r.json())
      .then((data) => {
        setEventTypes(data.eventTypes ?? []);
        setTeamSlug(data.teamSlug ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  const copyLink = async (link: string, id: number) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  if (loading) return <div style={{ color: DESIGN.muted, padding: 24 }}>Loading…</div>;

  return (
    <div style={{ background: DESIGN.bg }}>
      {/* Team booking link */}
      {teamSlug && (
        <div
          style={{
            background: DESIGN.card,
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: DESIGN.muted, marginBottom: 4 }}>
              Team Booking Page
            </div>
            <div style={{ fontSize: 14, color: DESIGN.brand, fontFamily: "monospace" }}>
              {process.env.NEXT_PUBLIC_WEBAPP_URL ?? ""}/team/{teamSlug}
            </div>
          </div>
          <button
            onClick={() =>
              copyLink(`${process.env.NEXT_PUBLIC_WEBAPP_URL ?? ""}/team/${teamSlug}`, 0)
            }
            style={{
              background: "transparent",
              border: `1px solid ${DESIGN.border}`,
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              cursor: "pointer",
              color: DESIGN.text,
            }}>
            {copied === 0 ? "✓ Copied" : "Copy link"}
          </button>
        </div>
      )}

      {/* Event types list */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: `1px solid ${DESIGN.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: 0 }}>
            Event Types ({eventTypes.length})
          </h3>
        </div>

        {eventTypes.length === 0 ? (
          <div style={{ padding: 24, color: DESIGN.muted, fontSize: 14 }}>
            No event types yet. Create team event types from the event types page.
          </div>
        ) : (
          <div>
            {eventTypes.map((et, i) => {
              const typeInfo = et.schedulingType
                ? SCHEDULING_TYPE_LABELS[et.schedulingType]
                : null;
              return (
                <div
                  key={et.id}
                  style={{
                    padding: "16px 24px",
                    borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    opacity: et.hidden ? 0.5 : 1,
                  }}>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: DESIGN.text }}>
                        {et.title}
                      </span>
                      {et.hidden && (
                        <span
                          style={{
                            fontSize: 11,
                            color: DESIGN.muted,
                            background: "#f1f5f9",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}>
                          Hidden
                        </span>
                      )}
                      {typeInfo && (
                        <span
                          style={{
                            fontSize: 11,
                            color: typeInfo.color,
                            background: `${typeInfo.color}15`,
                            padding: "2px 8px",
                            borderRadius: 99,
                            fontWeight: 500,
                          }}>
                          {typeInfo.label}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: DESIGN.muted }}>
                      {et.length} min
                      {et.description ? ` · ${et.description.slice(0, 60)}${et.description.length > 60 ? "…" : ""}` : ""}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: DESIGN.muted,
                        fontFamily: "monospace",
                        marginTop: 2,
                      }}>
                      /team/{teamSlug}/{et.slug}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: DESIGN.brand }}>
                      {et.bookingCount}
                    </div>
                    <div style={{ fontSize: 11, color: DESIGN.muted }}>bookings</div>
                  </div>

                  {/* Copy */}
                  <button
                    onClick={() => copyLink(et.link, et.id)}
                    style={{
                      background: "transparent",
                      border: `1px solid ${DESIGN.border}`,
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: DESIGN.text,
                      whiteSpace: "nowrap",
                    }}>
                    {copied === et.id ? "✓ Copied" : "Copy link"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
