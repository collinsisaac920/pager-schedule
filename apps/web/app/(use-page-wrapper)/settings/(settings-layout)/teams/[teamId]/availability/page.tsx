import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import TeamAvailabilityView from "~/settings/teams/availability-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Team Scheduling",
    () => "Configure scheduling algorithm, working hours, and buffer times"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Team Scheduling"
      description="Configure round-robin, collective availability, and buffer times"
      borderInShellHeader>
      <TeamAvailabilityView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
