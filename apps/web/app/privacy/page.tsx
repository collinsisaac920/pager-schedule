// @ts-nocheck
import PagerScheduleFooter from "@components/footer/PagerScheduleFooter";
import { Icon } from "@calcom/ui/components/icon";

const privacyFeatures = [
  {
    icon: "shield",
    title: "Zero Tracking",
    description: "No third-party analytics scripts on your booking pages. We don't track your visitors.",
  },
  {
    icon: "lock",
    title: "End-to-End Encryption",
    description: "All booking data encrypted at rest. Your meetings belong to you.",
  },
  {
    icon: "eye",
    title: "No Data Selling",
    description: "We never sell or share your data with advertisers or third parties.",
  },
  {
    icon: "circle-help",
    title: "EU Hosted",
    description: "All data stored in EU data centers. GDPR compliant by design.",
  },
  {
    icon: "calendar-check-2",
    title: "ProtonMail Compatible",
    description: "Works seamlessly with encrypted email providers like ProtonMail.",
  },
  {
    icon: "file-text",
    title: "Transparency Reports",
    description: "Regular transparency reports on requests and data access.",
  },
];

export const metadata = {
  title: "Privacy - Pager Schedule",
  description: "Privacy-first scheduling. Zero tracking, full encryption, GDPR compliance.",
};

export default function PrivacyPage() {
  return (
    <>
    <div className="bg-default min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="font-cal text-emphasis text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy First
          </h1>
          <p className="text-default mt-4 text-lg">
            Built for people who value privacy. Zero tracking on your booking pages.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {privacyFeatures.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="bg-brand-subtle mx-auto flex h-12 w-12 items-center justify-center rounded-lg">
                <Icon name={feature.icon as any} className="text-brand h-6 w-6" />
              </div>
              <h3 className="text-emphasis mt-4 font-semibold">{feature.title}</h3>
              <p className="text-default mt-2 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="border-subtle mt-16 rounded-lg border p-6">
          <h2 className="text-emphasis text-xl font-semibold">Our Promise</h2>
          <ul className="text-default mt-4 space-y-3">
            <li className="flex items-start">
              <span className="text-brand mr-2">✓</span>
              <span>No third-party analytics on booking pages</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">✓</span>
              <span>All data encrypted at rest</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">✓</span>
              <span>Hosted in EU with GDPR compliance</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">✓</span>
              <span>No data selling or advertising</span>
            </li>
            <li className="flex items-start">
              <span className="text-brand mr-2">✓</span>
              <span>Works with ProtonMail encryption</span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-subtle text-sm">
            Questions?{" "}
            <a href="mailto:support@pagerschedule.com" className="text-brand hover:underline">
              Contact our privacy team
            </a>
          </p>
        </div>
      </div>
    </div>
    <PagerScheduleFooter />
    </>
  );
}
