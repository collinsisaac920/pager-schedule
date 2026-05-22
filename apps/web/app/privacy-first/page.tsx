// @ts-nocheck
import PagerScheduleFooter from "@components/footer/PagerScheduleFooter";
import { Button } from "@calcom/ui/components/button";

export const metadata = {
  title: "Privacy Architecture - Pager Schedule",
  description: "Zero knowledge. Zero trust. Zero data. How Pager Schedule protects your scheduling data.",
};

const stats = [
  { value: "0", label: "Tracking pixels on booking pages" },
  { value: "0", label: "Third party scripts" },
  { value: "0", label: "US data transfers" },
  { value: "0", label: "Marketing emails sent" },
];

const features = [
  {
    icon: "◎",
    title: "Zero Tracking",
    description:
      "No Google Analytics. No Facebook pixel. No cookies on your booking page.",
  },
  {
    icon: "🍎",
    title: "Apple Calendar",
    description:
      "Full iCloud Calendar support. Calendly dropped this in August 2024. We never will.",
  },
  {
    icon: "✉️",
    title: "Protonmail Works",
    description:
      "Book with any email provider. Privacy-conscious clients are not forced to use Gmail.",
  },
  {
    icon: "🇪🇺",
    title: "EU Servers",
    description: "All data hosted in Europe. GDPR compliant by default.",
  },
  {
    icon: "🔐",
    title: "Encrypted at Rest",
    description:
      "Booking data encrypted on our servers. Even we cannot read your appointments.",
  },
];

const encryptionStack = [
  { data: "Booking data", method: "AES-256 at rest" },
  { data: "In transit", method: "TLS 1.3" },
  { data: "Emails", method: "Zero tracking pixels" },
  { data: "Passwords", method: "bcrypt hashed" },
  { data: "Sessions", method: "Secure httpOnly cookies" },
];

export default function PrivacyFirstPage() {
  return (
    <>
    <div className="bg-default min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Hero */}
        <div className="text-center">
          <h1 className="font-cal text-emphasis text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Architecture
          </h1>
          <p className="text-default mt-4 text-xl">Zero knowledge. Zero trust. Zero data.</p>
        </div>

        {/* Section 1 — The Numbers */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-subtle bg-muted rounded-lg border p-6 text-center">
              <div className="text-brand text-5xl font-bold">{stat.value}</div>
              <p className="text-default mt-2 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section 2 — How It Works */}
        <div className="mt-20">
          <h2 className="text-emphasis text-center text-2xl font-semibold">How It Works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border-subtle rounded-lg border p-6">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="text-emphasis mt-3 font-semibold">{feature.title}</h3>
                <p className="text-default mt-2 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Encryption Stack */}
        <div className="mt-20">
          <h2 className="text-emphasis text-center text-2xl font-semibold">Encryption Stack</h2>
          <div className="border-subtle mt-8 overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-default px-6 py-3 text-left font-semibold">Data</th>
                  <th className="text-default px-6 py-3 text-left font-semibold">Protection</th>
                </tr>
              </thead>
              <tbody className="divide-subtle divide-y">
                {encryptionStack.map((row) => (
                  <tr key={row.data}>
                    <td className="text-default px-6 py-4">{row.data}</td>
                    <td className="text-emphasis px-6 py-4 font-mono text-xs">{row.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4 — Warrant Canary */}
        <div className="mt-20">
          <div className="rounded-lg bg-black p-8 text-center">
            <p className="font-mono text-lg font-semibold text-green-400">
              ◎ Warrant Canary — Active
            </p>
            <p className="mt-3 font-mono text-sm text-green-400/80">
              No government requests received.
            </p>
            <p className="font-mono text-sm text-green-400/80">
              No user data has been disclosed.
            </p>
            <p className="mt-3 font-mono text-xs text-green-400/60">Last updated: May 2026</p>
          </div>
        </div>

        {/* Section 5 — Open Source */}
        <div className="mt-16 text-center">
          <h2 className="text-emphasis text-2xl font-semibold">Open Source</h2>
          <p className="text-default mt-3">Verify our privacy claims yourself.</p>
          <p className="text-default mt-1">
            The booking page code is open source under Apache 2.0.
          </p>
          <Button
            href="https://github.com/pagerschedule/pagerschedule"
            target="_blank"
            color="secondary"
            className="mt-6"
            EndIcon="external-link">
            View source code
          </Button>
        </div>

      </div>
    </div>
    <PagerScheduleFooter />
    </>
  );
}
