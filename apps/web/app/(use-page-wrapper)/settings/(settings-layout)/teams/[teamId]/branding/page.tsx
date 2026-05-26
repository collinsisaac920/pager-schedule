import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import BrandingView from "~/settings/teams/branding-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "White-label Branding",
    () => "Customise your team's logo, colors, and branding"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="White-label Branding"
      description="Customise your team's logo, colors, and remove PagerSchedule branding"
      borderInShellHeader>
      <BrandingView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
