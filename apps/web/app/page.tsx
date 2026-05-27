import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { checkOnboardingRedirect } from "@calcom/features/auth/lib/onboardingUtils";
import LandingPage from "@components/landing/LandingPage";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { Plus_Jakarta_Sans } from "next/font/google";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const RootPage = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  // Show the public landing page to unauthenticated visitors
  if (!session?.user?.id) {
    return (
      <div className={plusJakarta.className} style={{ minHeight: "100vh", background: "#e8e8f0" }}>
        <LandingPage />
      </div>
    );
  }

  // Check if user needs onboarding and redirect before going to event-types
  const organizationId = session.user.profile?.organizationId ?? null;
  const onboardingPath = await checkOnboardingRedirect(session.user.id, {
    checkEmailVerification: true,
    organizationId,
  });
  if (onboardingPath) {
    redirect(onboardingPath);
  }

  redirect("/event-types");
};

export default RootPage;
