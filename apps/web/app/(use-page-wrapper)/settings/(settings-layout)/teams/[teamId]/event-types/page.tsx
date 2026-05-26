import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import TeamEventTypesView from "~/settings/teams/event-types-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Team Event Types",
    () => "Manage shared event types and booking links for your team"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Team Event Types"
      description="Manage shared event types and copy booking links"
      borderInShellHeader>
      <TeamEventTypesView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
