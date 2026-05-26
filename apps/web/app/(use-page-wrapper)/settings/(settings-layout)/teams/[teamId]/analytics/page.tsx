import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import TeamAnalyticsView from "~/settings/teams/analytics-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Team Analytics",
    () => "View booking trends, event type performance, and team activity"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Team Analytics"
      description="Booking trends, event performance, and team member activity"
      borderInShellHeader>
      <TeamAnalyticsView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
