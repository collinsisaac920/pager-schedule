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

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "#7c3aed",
  ADMIN: "#2563eb",
  MEMBER: "#16a34a",
  VIEWER: "#64748b",
};

interface Member {
  id: number;
  name: string | null;
  email: string;
  role: string;
  accepted: boolean;
  avatarUrl?: string;
}

interface TeamMembersViewProps {
  teamId: number;
}

export default function TeamMembersView({ teamId }: TeamMembersViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    const res = await fetch(`/api/teams/${teamId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
      setCurrentUserRole(data.currentUserRole ?? "MEMBER");
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, [teamId]);

  const handleInvite = async () => {
    setInviting(true);
    setInviteMessage("");
    const res = await fetch(`/api/teams/${teamId}/members/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    setInviteMessage(res.ok ? `✓ Invitation sent to ${inviteEmail}` : data.error ?? "Failed");
    if (res.ok) setInviteEmail("");
    setInviting(false);
    if (res.ok) fetchMembers();
  };

  const handleRoleChange = async (memberId: number, newRole: string) => {
    await fetch(`/api/teams/${teamId}/members/${memberId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    fetchMembers();
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm("Remove this member from the team?")) return;
    await fetch(`/api/teams/${teamId}/members/${memberId}`, { method: "DELETE" });
    fetchMembers();
  };

  const canManage = ["OWNER", "ADMIN"].includes(currentUserRole);

  if (loading) return <div style={{ color: DESIGN.muted, padding: 24 }}>Loading…</div>;

  return (
    <div style={{ background: DESIGN.bg }}>
      {/* Invite new member */}
      {canManage && (
        <div
          style={{
            background: DESIGN.card,
            border: `1px solid ${DESIGN.border}`,
            borderRadius: 12,
            padding: 24,
            marginBottom: 20,
          }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: "0 0 16px" }}>
            Invite new member
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{
                padding: "8px 12px",
                border: `1px solid ${DESIGN.border}`,
                borderRadius: 8,
                fontSize: 14,
              }}>
              {["MEMBER", "ADMIN", "VIEWER"].map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail || inviting}
              style={{
                background: DESIGN.brand,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 14,
                cursor: !inviteEmail || inviting ? "not-allowed" : "pointer",
                opacity: !inviteEmail || inviting ? 0.6 : 1,
              }}>
              {inviting ? "Sending…" : "Send invite"}
            </button>
          </div>
          {inviteMessage && (
            <p
              style={{
                marginTop: 8,
                fontSize: 13,
                color: inviteMessage.startsWith("✓") ? "#16a34a" : "#dc2626",
              }}>
              {inviteMessage}
            </p>
          )}
        </div>
      )}

      {/* Members list */}
      <div
        style={{
          background: DESIGN.card,
          border: `1px solid ${DESIGN.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DESIGN.border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: DESIGN.text, margin: 0 }}>
            Members ({members.length})
          </h3>
        </div>

        {members.length === 0 ? (
          <div style={{ padding: 24, color: DESIGN.muted, fontSize: 14 }}>No members yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Member", "Role", "Status", ...(canManage ? ["Actions"] : [])].map((h) => (
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
              {members.map((m, i) => (
                <tr
                  key={m.id}
                  style={{ borderTop: i > 0 ? `1px solid ${DESIGN.border}` : undefined }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: DESIGN.text }}>
                      {m.name ?? "—"}
                    </div>
                    <div style={{ fontSize: 12, color: DESIGN.muted }}>{m.email}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {canManage && currentUserRole === "OWNER" && m.role !== "OWNER" ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: `1px solid ${DESIGN.border}`,
                          borderRadius: 6,
                          fontSize: 13,
                          background: "#fff",
                        }}>
                        {Object.keys(ROLE_LABELS).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 10px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 500,
                          background: `${ROLE_COLORS[m.role]}15`,
                          color: ROLE_COLORS[m.role],
                        }}>
                        {ROLE_LABELS[m.role] ?? m.role}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: m.accepted ? "#16a34a" : DESIGN.muted,
                        fontWeight: 500,
                      }}>
                      {m.accepted ? "Active" : "Pending invite"}
                    </span>
                  </td>
                  {canManage && (
                    <td style={{ padding: "12px 16px" }}>
                      {m.role !== "OWNER" && (
                        <button
                          onClick={() => handleRemove(m.id)}
                          style={{
                            background: "transparent",
                            border: `1px solid #fecaca`,
                            color: "#dc2626",
                            borderRadius: 6,
                            padding: "4px 10px",
                            fontSize: 12,
                            cursor: "pointer",
                          }}>
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
