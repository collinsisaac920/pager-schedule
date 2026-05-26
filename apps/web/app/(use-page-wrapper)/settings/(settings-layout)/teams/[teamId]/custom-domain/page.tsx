import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import CustomDomainView from "~/settings/teams/custom-domain-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Custom Domain",
    () => "Use your own domain for your booking pages"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Custom Domain"
      description="Use your own domain for your team's booking pages"
      borderInShellHeader>
      <CustomDomainView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
