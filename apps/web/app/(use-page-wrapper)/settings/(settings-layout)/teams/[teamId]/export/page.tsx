import { _generateMetadata } from "app/_utils";

import SettingsHeader from "@calcom/features/settings/appDir/SettingsHeader";

import DataExportView from "~/settings/teams/export-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Data Export",
    () => "Export team bookings as CSV or JSON"
  );

const Page = ({ params }: { params: { teamId: string } }) => {
  return (
    <SettingsHeader
      title="Data Export"
      description="Download team bookings as CSV or JSON with optional date range filters"
      borderInShellHeader>
      <DataExportView teamId={parseInt(params.teamId, 10)} />
    </SettingsHeader>
  );
};

export default Page;
