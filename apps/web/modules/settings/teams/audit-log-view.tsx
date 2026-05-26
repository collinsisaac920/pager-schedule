"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@calcom/ui/components/button";

interface AuditLogEntry {
  id: string;
  action: string;
  resource: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: number;
    name: string | null;
    email: string;
  };
}

const ACTION_LABELS: Record<string, string> = {
  MEMBER_INVITED: "Member invited",
  MEMBER_REMOVED: "Member removed",
  ROLE_CHANGED: "Role changed",
  BULK_INVITE: "Bulk invite",
  BRANDING_UPDATED: "Branding updated",
  CUSTOM_DOMAIN_SET: "Custom domain set",
  CUSTOM_DOMAIN_VERIFIED: "Domain verified",
  EMAIL_TEMPLATE_SAVED: "Email template saved",
  DATA_EXPORTED: "Data exported",
  SETTINGS_CHANGED: "Settings changed",
  INCIDENT_CREATED: "Incident created",
  INCIDENT_RESOLVED: "Incident resolved",
  SCHEDULING_UPDATED: "Scheduling updated",
};

const ACTION_COLORS: Record<string, string> = {
  MEMBER_REMOVED: "bg-red-100 text-red-700",
  MEMBER_INVITED: "bg-green-100 text-green-700",
  BULK_INVITE: "bg-green-100 text-green-700",
  ROLE_CHANGED: "bg-yellow-100 text-yellow-700",
  CUSTOM_DOMAIN_VERIFIED: "bg-blue-100 text-blue-700",
  DATA_EXPORTED: "bg-purple-100 text-purple-700",
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function AuditLogView({ teamId }: { teamId: number }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLogs = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams({ limit: "50" });
      if (actionFilter) params.set("action", actionFilter);
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/teams/${teamId}/audit-log?${params}`);
      if (!res.ok) return null;
      return res.json() as Promise<{ logs: AuditLogEntry[]; nextCursor: string | null; hasMore: boolean }>;
    },
    [teamId, actionFilter]
  );

  useEffect(() => {
    setLoading(true);
    fetchLogs().then((data) => {
      if (data) {
        setLogs(data.logs);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
      setLoading(false);
    });
  }, [fetchLogs]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    const data = await fetchLogs(nextCursor);
    if (data) {
      setLogs((prev) => [...prev, ...data.logs]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    }
    setLoadingMore(false);
  };

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
        <p className="text-sm text-gray-500 mt-1">
          Track all administrative actions taken by team members.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filter by action</label>
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">All actions</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a] ?? a}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          No audit log entries yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">When</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Resource</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{log.actor.name ?? log.actor.email}</div>
                    {log.actor.name && (
                      <div className="text-xs text-gray-400">{log.actor.email}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"
                      }`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.resource ?? "—"}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-gray-500">
                    {log.metadata
                      ? Object.entries(log.metadata)
                          .map(([k, v]) => `${k}: ${String(v)}`)
                          .join(", ")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}>
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
