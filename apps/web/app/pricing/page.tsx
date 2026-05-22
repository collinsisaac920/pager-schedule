// @ts-nocheck
import PagerScheduleFooter from "@components/footer/PagerScheduleFooter";
import { Button } from "@calcom/ui/components/button";
import { Card } from "@calcom/ui/components/card";

const pricingTiers = [
  {
    name: "Free",
    price: "£0",
    period: "/month",
    description: "For individuals getting started",
    features: [
      "5 event types",
      "Apple Calendar support",
      "Protonmail compatible",
      "Zero tracking booking page",
      "Unlimited bookings",
      "EU data hosting",
      "No credit card required",
    ],
    cta: "Get started free",
    ctaNote: "Free forever · No credit card",
    href: "/auth/login",
  },
  {
    name: "Pro",
    price: "£4.99",
    period: "/month",
    badge: "Most popular",
    description: "For privacy-conscious professionals",
    features: [
      "Everything in Free",
      "Custom domain booking page",
      "Payment collection via Stripe",
      "Ghost OS terminal mode",
      "Encrypted booking data",
      "Remove Pager Schedule branding",
      "Priority support",
    ],
    cta: "Start 14-day free trial",
    ctaNote: "Then £4.99/month · Cancel anytime",
    href: "/upgrade",
    highlighted: true,
  },
  {
    name: "Team",
    price: "£9.99",
    period: "/user/month",
    description: "For privacy-first organisations",
    features: [
      "Everything in Pro",
      "Round robin scheduling",
      "Team availability view",
      "Admin console",
      "Audit logs",
      "SSO / SAML integration",
      "HIPAA compliance tier",
      "Dedicated support",
    ],
    cta: "Start 14-day free trial",
    ctaNote: "Then £9.99/user/month · Cancel anytime",
    href: "/upgrade",
  },
];

export const metadata = {
  title: "Pricing - Pager Schedule",
  description: "Privacy-first scheduling with zero tracking. Choose a plan that works for you.",
};

export default function PricingPage() {
  return (
    <>
    <div className="bg-default min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="font-cal text-emphasis text-4xl font-bold tracking-tight sm:text-5xl">Pricing</h1>
          <p className="text-default mt-4 text-lg">
            Privacy-first scheduling with zero tracking. All plans include end-to-end encryption.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={tier.highlighted ? "border-brand relative" : "border-subtle"}
              data-testid={`pricing-${tier.name.toLowerCase()}`}>
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand text-white px-3 py-1 text-xs font-semibold rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-emphasis text-xl font-semibold">{tier.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-default">{tier.period}</span>}
                </div>
                <p className="text-default mt-2">{tier.description}</p>
                <ul className="text-default mt-6 space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className="text-brand mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
<Button
                   href={tier.href}
                   className="mt-8 w-full"
                   color={tier.highlighted ? "primary" : "secondary"}>
                   {tier.cta}
                 </Button>
                 {tier.ctaNote && (
                   <p className="text-subtle mt-2 text-center text-xs">{tier.ctaNote}</p>
                 )}
               </div>
             </Card>
           ))}
         </div>

         <div className="mt-8 text-center">
           <p className="text-subtle text-sm">
             Free plan is free forever. Pro and Team include a 14-day free trial.
           </p>
           <p className="text-subtle text-sm">
             No charge until trial ends.
           </p>
         </div>

         <div className="mt-16 text-center">
          <p className="text-subtle text-sm">
            All prices in GBP. Need a custom plan?{" "}
            <a href="mailto:support@pagerschedule.com" className="text-brand hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
    <PagerScheduleFooter />
    </>
  );
}
