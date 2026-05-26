import { Suspense } from "react";

import StatusPageContent from "~/status/status-page-content";

export const metadata = {
  title: "PagerSchedule Status",
  description: "Live system status and uptime for PagerSchedule",
};

export default function StatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#64748b" }}>Loading status…</div>}>
      <StatusPageContent />
    </Suspense>
  );
}
