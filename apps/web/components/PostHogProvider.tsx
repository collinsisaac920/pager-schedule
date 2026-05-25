"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { initPostHog, posthog } from "@lib/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      posthog.capture("$pageview");
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return <>{children}</>;
}
