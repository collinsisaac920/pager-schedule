import { prisma } from "@calcom/prisma";

export interface ViolaContext {
  userName: string;
  currentPage: string;
  bookingCount: number;
  eventTypeCount: number;
  hasCalendarConnected: boolean;
  hasZoomConnected: boolean;
  twoFactorEnabled: boolean;
  accountAgeDays: number;
}

export async function buildViolaContext(userId: string, currentPage = "/"): Promise<ViolaContext> {
  // User IDs in this schema are Int — parse once and reuse
  const userIdInt = Number.parseInt(userId, 10);

  if (Number.isNaN(userIdInt)) {
    return {
      userName: "there",
      currentPage,
      bookingCount: 0,
      eventTypeCount: 0,
      hasCalendarConnected: false,
      hasZoomConnected: false,
      twoFactorEnabled: false,
      accountAgeDays: 0,
    };
  }

  try {
    const [user, bookingCount, eventTypeCount, credentials] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userIdInt },
        select: {
          name: true,
          twoFactorEnabled: true,
          createdDate: true,
        },
      }),
      prisma.booking.count({
        where: { userId: userIdInt, status: { not: "CANCELLED" } },
      }),
      prisma.eventType.count({
        where: { userId: userIdInt },
      }),
      prisma.credential.findMany({
        where: { userId: userIdInt },
        select: { type: true },
      }),
    ]);

    const credTypes = credentials.map((c) => c.type.toLowerCase());
    const hasCalendarConnected = credTypes.some(
      (t) => t.includes("google") || t.includes("office365") || t.includes("apple") || t.includes("outlook")
    );
    const hasZoomConnected = credTypes.some((t) => t.includes("zoom"));

    const createdDate = user?.createdDate ?? new Date();
    const accountAgeDays = Math.floor((Date.now() - new Date(createdDate).getTime()) / (1000 * 60 * 60 * 24));

    const firstName = (user?.name ?? "").split(" ")[0] || "there";

    return {
      userName: firstName,
      currentPage,
      bookingCount,
      eventTypeCount,
      hasCalendarConnected,
      hasZoomConnected,
      twoFactorEnabled: user?.twoFactorEnabled ?? false,
      accountAgeDays,
    };
  } catch {
    // Return safe defaults if DB fails
    return {
      userName: "there",
      currentPage,
      bookingCount: 0,
      eventTypeCount: 0,
      hasCalendarConnected: false,
      hasZoomConnected: false,
      twoFactorEnabled: false,
      accountAgeDays: 0,
    };
  }
}
