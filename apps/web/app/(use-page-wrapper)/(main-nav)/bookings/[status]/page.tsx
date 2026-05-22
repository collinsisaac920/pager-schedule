import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { FeaturesRepository } from "@calcom/features/flags/features.repository";
import { prisma } from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { PagerScheduleBookingsDashboard } from "@components/dashboard/PagerScheduleBookingsDashboard";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validStatuses } from "~/bookings/lib/validStatuses";
import BookingsList from "~/bookings/views/bookings-view";

const querySchema = z.object({
  status: z.enum(validStatuses),
});

export const generateMetadata = async ({ params }: { params: Promise<{ status: string }> }) =>
  await _generateMetadata(
    (t) => t("bookings"),
    (t) => t("bookings_description"),
    undefined,
    undefined,
    `/bookings/${(await params).status}`
  );

const Page = async ({ params }: PageProps) => {
  const parsed = querySchema.safeParse(await params);
  if (!parsed.success) {
    redirect("/bookings/upcoming");
  }
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    return redirect("/auth/login");
  }

  const userId = session.user.id;
  const featuresRepository = new FeaturesRepository(prisma);

  const canReadOthersBookings = false;

  const [bookingAuditEnabled, bookingsV3Enabled] = await Promise.all([
    featuresRepository.checkIfUserHasFeature(userId, "booking-audit"),
    featuresRepository.checkIfUserHasFeature(userId, "bookings-v3"),
  ]);

  return (
    <PagerScheduleBookingsDashboard>
      <BookingsList
        status={parsed.data.status}
        userId={userId}
        permissions={{ canReadOthersBookings }}
        bookingsV3Enabled={bookingsV3Enabled}
        bookingAuditEnabled={bookingAuditEnabled}
      />
    </PagerScheduleBookingsDashboard>
  );
};

export default Page;
