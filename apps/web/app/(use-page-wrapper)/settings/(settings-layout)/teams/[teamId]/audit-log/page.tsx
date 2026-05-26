import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import AuditLogView from "~/settings/teams/audit-log-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Audit Log",
    () => "Track all administrative actions taken by team members"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Audit Log"
      description="Track all administrative actions taken by team members"
      borderInShellHeader>
      <AuditLogView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
