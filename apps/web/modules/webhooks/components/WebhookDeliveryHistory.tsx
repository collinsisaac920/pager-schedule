"use client";

import { useEffect, useState } from "react";

interface DeliveryRow {
  id: string;
  triggerEvent: string;
  subscriberUrl: string;
  statusCode: number | null;
  success: boolean;
  errorMessage: string | null;
  duration: number;
  createdAt: string;
}

export default function WebhookDeliveryHistory({ webhookId }: { webhookId: string }) {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/webhooks/${encodeURIComponent(webhookId)}/deliveries`)
      .then((r) => r.json())
      .then((data) => setDeliveries(data.deliveries ?? []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, [webhookId]);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading delivery history…</p>;
  }

  if (deliveries.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No deliveries recorded yet. Deliveries appear here after the first webhook is sent.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-semibold text-sm">Recent deliveries (last {deliveries.length})</h3>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Time</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Event</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Duration</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                  {new Date(d.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-gray-700 text-xs">{d.triggerEvent}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${
                      d.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {d.statusCode ?? (d.success ? "200" : "ERR")}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">{d.duration}ms</td>
                <td className="max-w-xs truncate px-3 py-2 text-red-600 text-xs">{d.errorMessage ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
