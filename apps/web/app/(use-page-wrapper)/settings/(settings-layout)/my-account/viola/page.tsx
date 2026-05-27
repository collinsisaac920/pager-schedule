import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { prisma } from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import ViolaSettingsView from "~/settings/my-account/viola-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Viola AI Settings",
    () => "Manage your Viola AI assistant preferences and usage.",
    undefined,
    undefined,
    "/settings/my-account/viola"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/auth/login?callbackUrl=/settings/my-account/viola");
  }

  const month = new Date().toISOString().slice(0, 7); // "2026-05"

  const usage = await prisma.aiUsage.findUnique({
    where: { userId_feature_month: { userId, feature: "viola-chat", month } },
    select: { count: true },
  });

  const plan = session.user.plan ?? "FREE";

  return <ViolaSettingsView userId={userId} messageCount={usage?.count ?? 0} plan={plan} />;
};

export default Page;
