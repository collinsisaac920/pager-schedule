import type { ViolaContext } from "./viola-context";

export interface ProactiveMessage {
  text: string;
  actionPath?: string;
  actionLabel?: string;
}

/**
 * Returns a proactive message to show when Viola opens, or null if nothing to suggest.
 * Priority: calendar > event types > 2FA
 */
export function getProactiveMessage(context: ViolaContext): ProactiveMessage | null {
  const { hasCalendarConnected, eventTypeCount, twoFactorEnabled, accountAgeDays } = context;

  // No calendar after 3 days → suggest connecting
  if (!hasCalendarConnected && accountAgeDays >= 3) {
    return {
      text: `${context.userName}, I noticed you haven't connected a calendar yet. Connecting your Google or Outlook calendar means PagerSchedule always shows your real availability. Head over to Apps to connect it in seconds!`,
      actionPath: "/apps",
      actionLabel: "Connect your calendar →",
    };
  }

  // No event types after 1 day → suggest creating one
  if (eventTypeCount === 0 && accountAgeDays >= 1) {
    return {
      text: `${context.userName}, you haven't created any event types yet. Event types are your meeting templates — once you create one, you'll get a shareable booking link right away. Let's set your first one up!`,
      actionPath: "/event-types",
      actionLabel: "Create an event type →",
    };
  }

  // No 2FA after 7 days → suggest enabling
  if (!twoFactorEnabled && accountAgeDays >= 7) {
    return {
      text: `${context.userName}, your account doesn't have two-factor authentication enabled yet. It only takes a minute to set up and keeps your booking page and data much more secure. Want me to take you to Security settings?`,
      actionPath: "/settings/security",
      actionLabel: "Enable two-factor auth →",
    };
  }

  return null;
}
