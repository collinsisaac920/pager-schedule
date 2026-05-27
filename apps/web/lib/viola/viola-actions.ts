export interface ViolaAction {
  type: "navigate" | "email";
  path: string;
  label: string;
}

// Maps keywords in Viola's response to navigation actions
const ROUTE_PATTERNS: Array<{ keywords: RegExp; path: string; label: string }> = [
  {
    keywords: /event.?type|meeting.?template|create.*meeting|new.*event/i,
    path: "/event-types",
    label: "Go to Event Types →",
  },
  {
    keywords: /your booking|upcoming.*booking|past.*booking|booking.?list|view.*booking/i,
    path: "/bookings",
    label: "View Bookings →",
  },
  {
    keywords: /availab|schedule|working.*hour|when.*work/i,
    path: "/availability",
    label: "Set Availability →",
  },
  {
    keywords:
      /connect.*calendar|calendar.*connect|google.*calendar|outlook|sync.*calendar|reconnect.*calendar/i,
    path: "/apps",
    label: "Connect Calendar →",
  },
  {
    keywords: /connect.*zoom|zoom.*connect|reconnect.*zoom|zoom.*integration/i,
    path: "/apps",
    label: "Connect Zoom →",
  },
  { keywords: /\/apps|integrations.*page|apps.*page|head.*to.*apps/i, path: "/apps", label: "Open Apps →" },
  {
    keywords: /security.*setting|two.?factor|2fa|enable.*2fa/i,
    path: "/settings/security",
    label: "Security Settings →",
  },
  {
    keywords: /billing|upgrade|plan.*page|subscription|payment.*setting/i,
    path: "/settings/billing",
    label: "Billing Settings →",
  },
  {
    keywords: /profile.*setting|edit.*profile|your.*profile/i,
    path: "/settings/my-account/profile",
    label: "Edit Profile →",
  },
  {
    keywords: /general.*setting|account.*setting/i,
    path: "/settings/my-account/general",
    label: "Account Settings →",
  },
  {
    keywords: /forgot.*password|reset.*password|password.*reset/i,
    path: "/auth/forgot-password",
    label: "Reset Password →",
  },
];

const EMAIL_PATTERN = /support@pagerschedule\.com|email.*support|contact.*support/i;

/**
 * Scans Viola's response text and returns an action (navigate or email) if found.
 * Returns null if no actionable path is detected.
 */
export function detectAction(responseText: string): ViolaAction | null {
  if (!responseText) return null;

  // Check for support email mention first
  if (EMAIL_PATTERN.test(responseText)) {
    return {
      type: "email",
      path: "mailto:support@pagerschedule.com",
      label: "Email support →",
    };
  }

  // Check route patterns
  for (const pattern of ROUTE_PATTERNS) {
    if (pattern.keywords.test(responseText)) {
      return {
        type: "navigate",
        path: pattern.path,
        label: pattern.label,
      };
    }
  }

  return null;
}
