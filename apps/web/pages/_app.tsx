import type { IncomingMessage } from "node:http";
import type { NextPageContext } from "next";
import { SessionProvider } from "next-auth/react";
import React from "react";
import CacheProvider from "react-inlinesvg/provider";

import { WebPushProvider } from "@calcom/web/modules/notifications/components/WebPushContext";
import { trpc } from "@calcom/trpc/react";

import type { AppProps } from "@lib/app-providers";
import { PostHogProvider } from "@components/PostHogProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "../styles/globals.css";

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <PostHogProvider>
      <SessionProvider session={pageProps.session ?? undefined}>
        <WebPushProvider>
          {/* @ts-expect-error FIXME remove this comment when upgrading typescript to v5 */}
          <CacheProvider>
            {Component.PageWrapper ? <Component.PageWrapper {...props} /> : <Component {...pageProps} />}
          </CacheProvider>
        </WebPushProvider>
      </SessionProvider>
      <Analytics />
      <SpeedInsights />
    </PostHogProvider>
  );
}

declare global {
  interface Window {
    calNewLocale: string;
  }
}

MyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
  const { req } = ctx;

  let newLocale = "en";

  if (req) {
    const { getLocale } = await import("@calcom/features/auth/lib/getLocale");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newLocale = await getLocale(req as IncomingMessage & { cookies: Record<string, any> });
  } else if (typeof window !== "undefined" && window.calNewLocale) {
    newLocale = window.calNewLocale;
  }

  return {
    pageProps: {
      newLocale,
    },
  };
};

const WrappedMyApp = trpc.withTRPC(MyApp);

export default WrappedMyApp;
