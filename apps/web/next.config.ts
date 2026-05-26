import { withBotId } from "botid/next/config";
import { config as dotenvConfig } from "dotenv";
import type { NextConfig } from "next";
import type { RouteHas } from "next/dist/lib/load-custom-routes";
import { withAxiom } from "next-axiom";
import { withSentryConfig } from "@sentry/nextjs";
import i18nConfig from "@calcom/i18n/next-i18next.config";
import packageJson from "./package.json";
import {
  nextJsOrgRewriteConfig,
  orgUserRoutePath,
  orgUserTypeEmbedRoutePath,
  orgUserTypeRoutePath,
} from "./pagesAndRewritePaths";
import { TRIGGER_VERSION } from "./trigger.version"; // adjust path as needed

dotenvConfig({ path: "../../.env" });

const { version } = packageJson;
const {
  i18n: { locales },
} = i18nConfig;

type NextConfigPlugin = (config: NextConfig) => NextConfig;

// Type guard to filter out null/undefined values with proper type narrowing
function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function adjustEnvVariables(): void {
  // Type-safe way to modify process.env (which is typed as readonly in environment.d.ts)
  const envMutable = process.env as Record<string, string | undefined>;
  if (process.env.NEXT_PUBLIC_SINGLE_ORG_SLUG) {
    if (process.env.RESERVED_SUBDOMAINS) {
      console.warn(
        `⚠️  WARNING: RESERVED_SUBDOMAINS is ignored when SINGLE_ORG_SLUG is set. Single org mode doesn't need to use reserved subdomain validation.`
      );
      delete envMutable.RESERVED_SUBDOMAINS;
    }

    if (!process.env.ORGANIZATIONS_ENABLED) {
      console.log("Auto-enabling ORGANIZATIONS_ENABLED because SINGLE_ORG_SLUG is set");
      envMutable.ORGANIZATIONS_ENABLED = "1";
    }
  }
}

adjustEnvVariables();

if (!process.env.NEXTAUTH_SECRET) throw new Error("Please set NEXTAUTH_SECRET");
if (!process.env.CALENDSO_ENCRYPTION_KEY) throw new Error("Please set CALENDSO_ENCRYPTION_KEY");

const isOrganizationsEnabled =
  process.env.ORGANIZATIONS_ENABLED === "1" || process.env.ORGANIZATIONS_ENABLED === "true";

// Type-safe way to assign to process.env (which is typed as readonly in environment.d.ts)
const env = process.env as Record<string, string | undefined>;

env.NEXT_PUBLIC_CALCOM_VERSION = version;

// Expose SMS availability to the client based on Twilio credentials
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN &&
    (process.env.TWILIO_PHONE_NUMBER ?? process.env.TWILIO_WHATSAPP_NUMBER)) {
  env.NEXT_PUBLIC_SMS_2FA_ENABLED = "true";
}

if (process.env.NODE_ENV === "production" || process.env.CALCOM_ENV === "production") {
  env.TRIGGER_VERSION = TRIGGER_VERSION;
}

if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_WEBAPP_URL) {
  env.NEXT_PUBLIC_WEBAPP_URL = `https://${process.env.VERCEL_URL}`;
}

if (!process.env.NEXTAUTH_URL && process.env.NEXT_PUBLIC_WEBAPP_URL) {
  env.NEXTAUTH_URL = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/auth`;
}

if (!process.env.NEXT_PUBLIC_WEBSITE_URL) {
  env.NEXT_PUBLIC_WEBSITE_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;
}

if (
  process.env.CSP_POLICY === "strict" &&
  (process.env.CALCOM_ENV === "production" || process.env.NODE_ENV === "production")
) {
  throw new Error(
    "Strict CSP policy(for style-src) is not yet supported in production. You can experiment with it in Dev Mode"
  );
}

if (!process.env.EMAIL_FROM) {
  console.warn(
    "\x1b[33mwarn",
    "\x1b[0m",
    "EMAIL_FROM environment variable is not set, this may indicate mailing is currently disabled. Please refer to the .env.example file."
  );
}

if (!process.env.NEXTAUTH_URL) throw new Error("Please set NEXTAUTH_URL");

function getHttpsUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
}

if (process.argv.includes("--experimental-https")) {
  env.NEXT_PUBLIC_WEBAPP_URL = getHttpsUrl(process.env.NEXT_PUBLIC_WEBAPP_URL);
  env.NEXTAUTH_URL = getHttpsUrl(process.env.NEXTAUTH_URL);
  env.NEXT_PUBLIC_EMBED_LIB_URL = getHttpsUrl(process.env.NEXT_PUBLIC_EMBED_LIB_URL);
}

function validJson(jsonString: string): object | false {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

if (process.env.GOOGLE_API_CREDENTIALS && !validJson(process.env.GOOGLE_API_CREDENTIALS)) {
  console.warn(
    "\x1b[33mwarn",
    "\x1b[0m",
    '- Disabled \'Google Calendar\' integration. Reason: Invalid value for GOOGLE_API_CREDENTIALS environment variable. When set, this value needs to contain valid JSON like {"web":{"client_id":"<clid>","client_secret":"<secret>","redirect_uris":["<yourhost>/api/integrations/googlecalendar/callback>"]}. You can download this JSON from your OAuth Client @ https://console.cloud.google.com/apis/credentials.'
  );
}

const plugins: NextConfigPlugin[] = [];

if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  });
  plugins.push(withBundleAnalyzer);
}

plugins.push(withAxiom);

if (process.env.NEXT_PUBLIC_VERCEL_USE_BOTID_IN_BOOKER === "1") {
  plugins.push(withBotId);
}

interface OrgDomainMatcher {
  has: RouteHas[];
  source: string;
}

const orgDomainMatcherConfig: {
  root: OrgDomainMatcher | null;
  rootEmbed: OrgDomainMatcher | null;
  user: OrgDomainMatcher;
  userType: OrgDomainMatcher;
  userTypeEmbed: OrgDomainMatcher;
} = {
  root: nextJsOrgRewriteConfig.disableRootPathRewrite
    ? null
    : {
        has: [
          {
            type: "host",
            value: nextJsOrgRewriteConfig.orgHostPath,
          },
        ],
        source: "/",
      },

  rootEmbed: nextJsOrgRewriteConfig.disableRootEmbedPathRewrite
    ? null
    : {
        has: [
          {
            type: "host",
            value: nextJsOrgRewriteConfig.orgHostPath,
          },
        ],
        source: "/embed",
      },

  user: {
    has: [
      {
        type: "host",
        value: nextJsOrgRewriteConfig.orgHostPath,
      },
    ],
    source: orgUserRoutePath,
  },

  userType: {
    has: [
      {
        type: "host",
        value: nextJsOrgRewriteConfig.orgHostPath,
      },
    ],
    source: orgUserTypeRoutePath,
  },

  userTypeEmbed: {
    has: [
      {
        type: "host",
        value: nextJsOrgRewriteConfig.orgHostPath,
      },
    ],
    source: orgUserTypeEmbedRoutePath,
  },
};

const nextConfig = (phase: string): NextConfig => {
  if (isOrganizationsEnabled) {
    console.log(
      `[Phase: ${phase}] Adding rewrite config for organizations - orgHostPath: ${nextJsOrgRewriteConfig.orgHostPath}, orgSlug: ${nextJsOrgRewriteConfig.orgSlug}, disableRootPathRewrite: ${nextJsOrgRewriteConfig.disableRootPathRewrite}`
    );
  } else {
    console.log(
      `[Phase: ${phase}] Skipping rewrite config for organizations because ORGANIZATIONS_ENABLED is not set`
    );
  }

  return {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
    serverExternalPackages: [
      "deasync",
      "http-cookie-agent",
      "rest-facade",
      "superagent-proxy",
      "superagent",
      "formidable",
      "@boxyhq/saml-jackson",
      "jose",
    ],
    experimental: {
      optimizePackageImports: ["@calcom/ui"],
    },
    // Source maps must never be public — upload to Sentry via CI instead.
    // Serving .map files exposes full TypeScript source to any browser.
    productionBrowserSourceMaps: false,
    transpilePackages: [
      "@calcom/app-store",
      "@calcom/dayjs",
      "@calcom/emails",
      "@calcom/embed-core",
      "@calcom/features",
      "@calcom/lib",
      "@calcom/prisma",
      "@calcom/trpc",
      "@coss/ui",
    ],
    modularizeImports: {
      lodash: {
        transform: "lodash/{{member}}",
      },
    },
    images: {
      unoptimized: true,
    },
    turbopack: {},
    async rewrites() {
      const { orgSlug } = nextJsOrgRewriteConfig;
      const beforeFiles = [
        {
          source: `/(${locales.join("|")})/:path*`,
          destination: "/:path*",
        },
        {
          source: "/forms/:formQuery*",
          destination: "/apps/routing-forms/routing-link/:formQuery*",
        },
        {
          source: "/routing-forms",
          destination: "/apps/routing-forms/forms",
        },
        {
          source: "/success/:path*",
          has: [
            {
              type: "query" as const,
              key: "uid",
              value: "(?<uid>.*)",
            },
          ],
          destination: "/booking/:uid/:path*",
        },
        {
          source: "/cancel/:path*",
          destination: "/booking/:path*",
        },
        {
          source: "/embed.js",
          destination: "/embed/embed.js",
        },
        {
          source: "/login",
          destination: "/auth/login",
        },
        ...(isOrganizationsEnabled
          ? [
              orgDomainMatcherConfig.root
                ? {
                    ...orgDomainMatcherConfig.root,
                    destination: `/team/${orgSlug}?isOrgProfile=1`,
                  }
                : null,
              orgDomainMatcherConfig.rootEmbed
                ? {
                    ...orgDomainMatcherConfig.rootEmbed,
                    destination: `/team/${orgSlug}/embed?isOrgProfile=1`,
                  }
                : null,
              {
                ...orgDomainMatcherConfig.user,
                destination: `/org/${orgSlug}/:user`,
              },
              {
                ...orgDomainMatcherConfig.userType,
                destination: `/org/${orgSlug}/:user/:type`,
              },
              {
                ...orgDomainMatcherConfig.userTypeEmbed,
                destination: `/org/${orgSlug}/:user/:type/embed`,
              },
            ]
          : []),
      ].filter(isNotNull);

      const afterFiles = [
        {
          source: "/routing/:path*",
          destination: "/apps/routing-forms/:path*",
        },
        {
          source: "/org/:slug",
          destination: "/team/:slug",
        },
        {
          source: "/org/:orgSlug/avatar.png",
          destination: "/api/user/avatar?orgSlug=:orgSlug",
        },
        {
          source: "/team/:teamname/avatar.png",
          destination: "/api/user/avatar?teamname=:teamname",
        },
        {
          source: "/icons/sprite.svg",
          destination: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/icons/sprite.svg`,
        },
        // Dub link tracking proxy — explicit paths only; wildcard removed to
        // prevent SSRF / path-traversal forwarding to arbitrary Dub endpoints.
        {
          source: "/_proxy/dub/track/click",
          destination: "https://api.dub.co/track/click",
        },
        {
          source: "/_proxy/dub/track/lead",
          destination: "https://api.dub.co/track/lead",
        },
        {
          source: "/_proxy/dub/track/sale",
          destination: "https://api.dub.co/track/sale",
        },
        {
          source: "/:user/avatar.png",
          destination: "/api/user/avatar?username=:user",
        },
      ];

      if (process.env.NEXT_PUBLIC_API_V2_URL) {
        afterFiles.push({
          source: "/api/v2/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_V2_URL}/:path*`,
        });
      }

      return {
        beforeFiles,
        afterFiles,
      };
    },
    async headers() {
      const { orgSlug } = nextJsOrgRewriteConfig;
      const CORP_CROSS_ORIGIN_HEADER = {
        key: "Cross-Origin-Resource-Policy",
        value: "cross-origin",
      };

      const ACCESS_CONTROL_ALLOW_ORIGIN_HEADER = {
        key: "Access-Control-Allow-Origin",
        value: "*",
      };

      // ---------------------------------------------------------------------------
      // Content Security Policy
      // Phase 1 starter CSP — allows 'unsafe-inline'/'unsafe-eval' until nonce
      // infrastructure is implemented in a follow-up.  Restricts the most
      // dangerous injection vectors (object, base-uri, form-action, frame-ancestors)
      // without risking breakage of Next.js hydration or existing integrations.
      //
      // Tighten progressively: remove 'unsafe-eval', then remove 'unsafe-inline'
      // once nonce-based CSP is wired through _document / middleware.
      // ---------------------------------------------------------------------------
      const CSP_DIRECTIVES = [
        "default-src 'self'",
        // Next.js requires 'unsafe-inline' + 'unsafe-eval' for hydration until
        // nonce-based CSP is implemented.
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.posthog.com https://app.posthog.com https://vercel.live https://*.vercel.live",
        "style-src 'self' 'unsafe-inline'",
        // Images: allow data URIs (avatars), blobs (uploads), and HTTPS sources.
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        // API connections: restrict to known third-party endpoints.
        [
          "connect-src 'self'",
          // PostHog EU ingest
          "https://eu.posthog.com",
          "https://eu.i.posthog.com",
          "https://app.posthog.com",
          // Sentry EU ingest
          "https://de.sentry.io",
          "https://*.ingest.sentry.io",
          // Vercel analytics + speed insights
          "https://vitals.vercel-insights.com",
          "https://vercel.live",
          // Dub link tracking (proxied via /_proxy/dub/track/*)
          "https://api.dub.co",
          // Twilio Verify (server-side; browser may initiate CORS preflight)
          "https://verify.twilio.com",
          // Axiom logging
          "https://api.axiom.co",
          // WebSocket for Next.js HMR in dev
          ...(process.env.NODE_ENV !== "production" ? ["ws://localhost:*"] : []),
        ].join(" "),
        // Booking embed runs in an iframe on third-party sites — allow framing
        // of /embed paths from any origin, but block all other pages from being
        // framed (replaces X-Frame-Options: DENY on non-embed pages).
        "frame-ancestors 'self'",
        // Prevent plugin embedding (Flash, etc.) entirely.
        "object-src 'none'",
        // Prevent <base> tag hijacking.
        "base-uri 'self'",
        // Restrict where forms can be submitted.
        "form-action 'self' https://checkout.stripe.com",
        // Workers: only same-origin.
        "worker-src 'self' blob:",
        // Enforce HTTPS for embedded resources in production.
        ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
      ].join("; ");

      return [
        {
          source: "/auth/:path*",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
          ],
        },
        {
          source: "/signup",
          headers: [
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
          ],
        },
        {
          source: "/:path*",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            },
            // Block clickjacking on all pages that don't already override this.
            {
              key: "X-Frame-Options",
              value: "SAMEORIGIN",
            },
            // Disable browser DNS pre-fetching to reduce information leakage.
            {
              key: "X-DNS-Prefetch-Control",
              value: "off",
            },
            // Restrict browser feature access to reduce the attack surface.
            // interest-cohort and browsing-topics opt out of Privacy Sandbox profiling.
            {
              key: "Permissions-Policy",
              value: [
                "camera=()",
                "microphone=()",
                "geolocation=()",
                "payment=()",
                "usb=()",
                "magnetometer=()",
                "gyroscope=()",
                "accelerometer=()",
                "interest-cohort=()",
                "browsing-topics=()",
              ].join(", "),
            },
            // Prevent cross-origin window.opener access.
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin-allow-popups",
            },
            // 2-year HSTS with subdomains and preload.
            // includeSubDomains ensures org subdomains also enforce HTTPS.
            // Submit domain to hstspreload.org after verifying all subdomains serve HTTPS.
            ...(process.env.NODE_ENV === "production"
              ? [
                  {
                    key: "Strict-Transport-Security",
                    value: "max-age=63072000; includeSubDomains; preload",
                  },
                ]
              : []),
            // Content Security Policy (Phase 1 starter).
            {
              key: "Content-Security-Policy",
              value: CSP_DIRECTIVES,
            },
          ],
        },
        {
          source: "/embed/embed.js",
          headers: [CORP_CROSS_ORIGIN_HEADER],
        },
        {
          source: "/:path*/embed",
          headers: [CORP_CROSS_ORIGIN_HEADER],
        },
        // Removed: the cal.com-specific override that weakened Referrer-Policy
        // from strict-origin-when-cross-origin to no-referrer-when-downgrade.
        // The global strict-origin-when-cross-origin policy is correct everywhere.
        {
          source: "/api/avatar/:path*",
          headers: [CORP_CROSS_ORIGIN_HEADER],
        },
        {
          source: "/avatar.svg",
          headers: [CORP_CROSS_ORIGIN_HEADER],
        },
        {
          source: "/icons/sprite.svg(\\?v=[0-9a-zA-Z\\-\\.]+)?",
          headers: [
            CORP_CROSS_ORIGIN_HEADER,
            ACCESS_CONTROL_ALLOW_ORIGIN_HEADER,
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        ...(isOrganizationsEnabled
          ? [
              orgDomainMatcherConfig.root
                ? {
                    ...orgDomainMatcherConfig.root,
                    headers: [
                      {
                        key: "X-Cal-Org-path",
                        value: `/team/${orgSlug}`,
                      },
                    ],
                  }
                : null,
              {
                ...orgDomainMatcherConfig.user,
                headers: [
                  {
                    key: "X-Cal-Org-path",
                    value: `/org/${orgSlug}/:user`,
                  },
                ],
              },
              {
                ...orgDomainMatcherConfig.userType,
                headers: [
                  {
                    key: "X-Cal-Org-path",
                    value: `/org/${orgSlug}/:user/:type`,
                  },
                ],
              },
              {
                ...orgDomainMatcherConfig.userTypeEmbed,
                headers: [
                  {
                    key: "X-Cal-Org-path",
                    value: `/org/${orgSlug}/:user/:type/embed`,
                  },
                ],
              },
            ]
          : []),
      ].filter(isNotNull);
    },
    async redirects() {
      const redirects = [
        {
          source: "/settings/organizations",
          destination: "/settings/organizations/profile",
          permanent: false,
        },
        {
          source: "/apps/routing-forms",
          destination: "/apps/routing-forms/forms",
          permanent: false,
        },
        {
          source: "/api/app-store/:path*",
          destination: "/app-store/:path*",
          permanent: true,
        },
        {
          source: "/auth/new",
          destination: process.env.NEXT_PUBLIC_WEBAPP_URL || "https://app.cal.com",
          permanent: true,
        },
        {
          source: "/auth/signup",
          destination: "/signup",
          permanent: true,
        },
        {
          source: "/auth",
          destination: "/auth/login",
          permanent: false,
        },
        {
          source: "/settings",
          destination: "/settings/my-account/profile",
          permanent: true,
        },
        {
          source: "/settings/teams",
          destination: "/teams",
          permanent: true,
        },
        {
          source: "/settings/admin",
          destination: "/settings/admin/flags",
          permanent: true,
        },
        {
          source: "/settings/profile",
          destination: "/settings/my-account/profile",
          permanent: false,
        },
        {
          source: "/settings/security",
          destination: "/settings/security/password",
          permanent: false,
        },
        {
          source: "/bookings",
          destination: "/bookings/upcoming",
          permanent: true,
        },
        {
          source: "/call/:path*",
          destination: "/video/:path*",
          permanent: false,
        },
        {
          source: "/api/auth/:path*",
          has: [
            {
              type: "query" as const,
              key: "callbackUrl",
              value: "^(?!https?://).*$",
            },
          ],
          destination: "/404",
          permanent: false,
        },
        // Legacy booking-direct redirect.
        // Email removed from the forwarded query string — /api/link identifies
        // the user from the encrypted token, not from a plaintext email in the URL.
        // The :email segment is still in the source pattern for backward compatibility
        // with links already in circulation, but we no longer forward it downstream.
        {
          source: "/booking/direct/:action/:email/:bookingUid/:oldToken",
          destination: "/api/link?action=:action&bookingUid=:bookingUid&token=:oldToken",
          permanent: true,
        },
        {
          source: "/support",
          missing: [
            {
              type: "header" as const,
              key: "host",
              value: nextJsOrgRewriteConfig.orgHostPath,
            },
          ],
          destination: "/event-types?openSupport=true",
          permanent: true,
        },
        {
          source: "/apps/categories/video",
          destination: "/apps/categories/conferencing",
          permanent: true,
        },
        {
          source: "/apps/installed/video",
          destination: "/apps/installed/conferencing",
          permanent: true,
        },
        {
          source: "/apps/installed",
          destination: "/apps/installed/calendar",
          permanent: true,
        },
        {
          source: "/settings/organizations/members",
          destination: "/members",
          permanent: true,
        },
        {
          source: "/settings/admin/apps",
          destination: "/settings/admin/apps/calendar",
          permanent: true,
        },
        ...(process.env.NODE_ENV === "development" &&
        isOrganizationsEnabled &&
        process.env.NEXT_PUBLIC_WEBAPP_URL !== "http://localhost:3000"
          ? [
              {
                has: [
                  {
                    type: "header" as const,
                    key: "host",
                    value: "localhost:3000",
                  },
                ],
                source: "/api/integrations/:args*",
                destination: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/integrations/:args*`,
                permanent: false,
              },
            ]
          : []),
      ];

      if (process.env.NEXT_PUBLIC_WEBAPP_URL === "https://app.cal.com") {
        redirects.push(
          {
            source: "/apps/dailyvideo",
            destination: "/apps/daily-video",
            permanent: true,
          },
          {
            source: "/apps/huddle01_video",
            destination: "/apps/huddle01",
            permanent: true,
          },
          {
            source: "/apps/jitsi_video",
            destination: "/apps/jitsi",
            permanent: true,
          }
        );
      }

      return redirects;
    },
  };
};

const calConfig = (phase: string): NextConfig => plugins.reduce((acc, plugin) => plugin(acc), nextConfig(phase));

export default withSentryConfig(calConfig, {
  org: "pager-schedule",
  project: "pager-schedule",
  sentryUrl: "https://de.sentry.io",
  // Route browser events through Next.js to avoid ad-blocker interference
  tunnelRoute: "/monitoring",
  // Upload source maps only when auth token is present (skips local dev)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Suppress non-error build output
  silent: !process.env.CI,
  // Capture React component display names in error traces
  reactComponentAnnotation: {
    enabled: true,
  },
  disableLogger: true,
  automaticVercelMonitors: false,
});
