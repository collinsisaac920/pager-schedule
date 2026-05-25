"use client";

import { TrpcProvider } from "app/_trpc/trpc-provider";
import { SessionProvider } from "next-auth/react";
import CacheProvider from "react-inlinesvg/provider";
import { ToastProvider } from "@coss/ui/components/toast";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { WebPushProvider } from "@calcom/web/modules/notifications/components/WebPushContext";
import { NotificationSoundHandler } from "@calcom/web/components/notification-sound-handler";

import { ThemeProvider } from "@lib/theme-context";
import useIsBookingPage from "@lib/hooks/useIsBookingPage";
import { initPostHog, posthog } from "@lib/posthog";

import { GeoProvider } from "./GeoContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

function PostHogPageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (pathname) {
      posthog.capture("$pageview");
    }
  }, [pathname]);

  return null;
}

type ProvidersProps = {
  isEmbed: boolean;
  children: React.ReactNode;
  nonce: string | undefined;
  country: string;
};
export function Providers({ isEmbed, children, country }: ProvidersProps) {
  const isBookingPage = useIsBookingPage();

  return (
    <GeoProvider country={country}>
      <ThemeProvider>
      <SessionProvider>
        <TrpcProvider>
          <ToastProvider position="bottom-center">
            <PostHogPageviewTracker />
            <Analytics />
            <SpeedInsights />
            {!isEmbed && !isBookingPage && <NotificationSoundHandler />}
            {/* @ts-expect-error FIXME remove this comment when upgrading typescript to v5 */}
            <CacheProvider>
              <WebPushProvider>{children}</WebPushProvider>
            </CacheProvider>
          </ToastProvider>
        </TrpcProvider>
      </SessionProvider>
      </ThemeProvider>
    </GeoProvider>
  );
}
