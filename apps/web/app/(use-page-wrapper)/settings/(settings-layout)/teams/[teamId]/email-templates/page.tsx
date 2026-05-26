import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import EmailTemplatesView from "~/settings/teams/email-templates-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Email Templates",
    () => "Customise the emails sent to attendees for your team"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Email Templates"
      description="Customise confirmation, cancellation, and reminder emails with your branding"
      borderInShellHeader>
      <EmailTemplatesView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
