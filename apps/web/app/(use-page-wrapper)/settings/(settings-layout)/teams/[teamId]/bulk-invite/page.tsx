import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import BulkInviteView from "~/settings/teams/bulk-invite-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Bulk Invite",
    () => "Invite multiple team members at once via CSV"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Bulk Invite"
      description="Upload a CSV or paste emails to invite multiple members at once"
      borderInShellHeader>
      <BulkInviteView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
