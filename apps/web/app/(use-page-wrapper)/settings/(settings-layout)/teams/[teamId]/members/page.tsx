import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import TeamMembersView from "~/settings/teams/members-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Team Members",
    () => "Manage team members and their roles"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Team Members"
      description="Manage your team members, invite new members, and assign roles"
      borderInShellHeader>
      <TeamMembersView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
