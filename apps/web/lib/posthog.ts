import posthog from "posthog-js";

export const initPostHog = () => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          email: true,
        },
      },
    });
  }
};

export { posthog };
