import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Terms of Service — PagerSchedule",
  description: "Terms of Service for PagerSchedule scheduling software.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          Please read these Terms of Service carefully before using PagerSchedule. By creating an account or
          using our service, you agree to be bound by these terms.
        </p>
      </div>

      <h2 className="legal-h2">1. Introduction</h2>
      <p className="legal-p">
        PagerSchedule is an online scheduling and booking platform operated by PagerSchedule
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms of Service
        (&ldquo;Terms&rdquo;) govern your access to and use of the PagerSchedule website and services
        available at{" "}
        <a href="https://pagerschedule.com" className="legal-a">
          pagerschedule.com
        </a>{" "}
        (collectively, the &ldquo;Service&rdquo;).
      </p>
      <p className="legal-p">
        By accessing or using the Service, you agree to these Terms. If you do not agree, you must not use the
        Service.
      </p>

      <h2 className="legal-h2">2. The Service</h2>
      <p className="legal-p">PagerSchedule provides:</p>
      <ul className="legal-ul">
        <li>Online scheduling and booking tools</li>
        <li>Calendar integrations (Google Calendar, Outlook, Apple Calendar, and others)</li>
        <li>Team scheduling and round-robin booking features</li>
        <li>AI-powered scheduling assistance</li>
        <li>Public booking pages for sharing your availability</li>
        <li>Automated email and SMS reminders and confirmations</li>
        <li>Analytics and reporting for bookings</li>
      </ul>
      <p className="legal-p">
        Access to the Service is provided on a subscription basis. A free plan is available with limited
        features. Paid plans unlock additional functionality as described on our pricing page.
      </p>

      <h2 className="legal-h2">3. Account Registration</h2>
      <p className="legal-p">
        To use PagerSchedule, you must create an account. By registering, you agree that:
      </p>
      <ul className="legal-ul">
        <li>You are at least 18 years of age</li>
        <li>You will provide accurate, current, and complete information</li>
        <li>You will keep your account information up to date</li>
        <li>You are responsible for maintaining the confidentiality of your password</li>
        <li>
          You will notify us immediately of any unauthorised access to your account at{" "}
          <a href="mailto:support@pagerschedule.com" className="legal-a">
            support@pagerschedule.com
          </a>
        </li>
        <li>You may only hold one personal account unless otherwise agreed with us in writing</li>
        <li>You will not share your account credentials with others</li>
      </ul>
      <p className="legal-p">
        We reserve the right to refuse registration or cancel accounts at our discretion.
      </p>

      <h2 className="legal-h2">4. Acceptable Use</h2>
      <p className="legal-p">
        You must use PagerSchedule lawfully and in accordance with these Terms. You must not:
      </p>
      <ul className="legal-ul">
        <li>Send spam, bulk unsolicited messages, or automated communications without consent</li>
        <li>Harass, threaten, defame, or harm other users or third parties</li>
        <li>Violate any applicable local, national, or international law or regulation</li>
        <li>Attempt to hack, disrupt, or gain unauthorised access to the Service or its systems</li>
        <li>Scrape, harvest, or collect data from the platform without our prior written permission</li>
        <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
        <li>Process illegal transactions or use the Service for unlawful purposes</li>
        <li>Upload or distribute malware, viruses, or other harmful code</li>
        <li>Circumvent any rate limiting, security, or access control features</li>
        <li>Use the Service in a way that could damage, disable, or impair its performance</li>
        <li>Facilitate or encourage others to violate these Terms</li>
      </ul>
      <p className="legal-p">
        Violation of this section may result in immediate account suspension or termination. Please also
        review our full{" "}
        <a href="/acceptable-use" className="legal-a">
          Acceptable Use Policy
        </a>
        .
      </p>

      <h2 className="legal-h2">5. Subscription and Billing</h2>
      <ul className="legal-ul">
        <li>A free plan is available with limited features and usage</li>
        <li>Paid plans are billed monthly or annually in advance</li>
        <li>All prices are displayed in USD unless otherwise stated</li>
        <li>Subscriptions renew automatically at the end of each billing period unless cancelled</li>
        <li>You may cancel your subscription at any time from your account Settings</li>
        <li>Upon cancellation, your paid access continues until the end of the current billing period</li>
        <li>
          We do not offer prorated refunds for partial billing periods, except as stated in our 30-day
          money-back guarantee below
        </li>
        <li>We reserve the right to change pricing with 30 days&apos; notice</li>
        <li>Failed payments may result in service downgrade or suspension</li>
      </ul>
      <p className="legal-p">
        All payments are processed securely by Stripe. We do not store your card details.
      </p>

      <h2 className="legal-h2">6. 30-Day Money-Back Guarantee</h2>
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          If you are not satisfied with PagerSchedule, new paid subscribers may request a full refund within
          30 days of their first payment. No questions asked. Contact us at{" "}
          <a href="mailto:support@pagerschedule.com" className="legal-a">
            support@pagerschedule.com
          </a>
          .
        </p>
      </div>
      <p className="legal-p">
        The 30-day guarantee applies to your first payment only and does not apply to subsequent renewals. See
        our full{" "}
        <a href="/refunds" className="legal-a">
          Refund Policy
        </a>{" "}
        for details.
      </p>

      <h2 className="legal-h2">7. Intellectual Property</h2>
      <p className="legal-p">
        All intellectual property rights in the Service — including software, designs, text, graphics, logos,
        and trademarks — are owned by or licensed to PagerSchedule. Nothing in these Terms transfers any
        intellectual property rights to you.
      </p>
      <ul className="legal-ul">
        <li>You own all booking data, meeting content, and information you create through the Service</li>
        <li>
          You grant PagerSchedule a limited, non-exclusive licence to store and display your content solely
          for the purpose of providing the Service
        </li>
        <li>
          The PagerSchedule name, logo, and &ldquo;SCHEDULE&rdquo; wordmark are our trademarks and may not be
          used without our written permission
        </li>
        <li>You must not copy, reproduce, or modify any part of the Service without our consent</li>
      </ul>

      <h2 className="legal-h2">8. Privacy</h2>
      <p className="legal-p">
        Your use of the Service is governed by our{" "}
        <a href="/privacy" className="legal-a">
          Privacy Policy
        </a>
        , which is incorporated into these Terms by reference. By using the Service, you consent to the
        collection and use of your information as described in the Privacy Policy.
      </p>

      <h2 className="legal-h2">9. Limitation of Liability</h2>
      <p className="legal-p">To the fullest extent permitted by law, PagerSchedule is not liable for:</p>
      <ul className="legal-ul">
        <li>Lost, missed, or double-booked meetings due to service outages or errors</li>
        <li>Data loss beyond our reasonable control</li>
        <li>Failures of third-party integrations (Google Calendar, Zoom, Stripe, etc.)</li>
        <li>Indirect, consequential, incidental, or punitive losses</li>
        <li>Loss of profits, revenue, or business opportunities</li>
        <li>Any actions taken in reliance on information provided through the Service</li>
      </ul>
      <p className="legal-p">
        Our total aggregate liability to you for any and all claims arising from these Terms or your use of
        the Service shall not exceed the total fees paid by you to PagerSchedule in the three months
        immediately preceding the event giving rise to the claim.
      </p>
      <p className="legal-p">
        Nothing in these Terms limits our liability for fraud, death, or personal injury caused by our
        negligence, or any other liability that cannot be excluded or limited by law.
      </p>

      <h2 className="legal-h2">10. Service Availability</h2>
      <p className="legal-p">
        We aim to maintain 99.9% monthly uptime for paid plans. We may perform scheduled maintenance from time
        to time, and where possible we will provide advance notice. Our{" "}
        <a href="/sla" className="legal-a">
          Service Level Agreement
        </a>{" "}
        sets out uptime commitments, exclusions, and service credit entitlements for paid subscribers.
      </p>
      <p className="legal-p">
        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not
        warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful
        components.
      </p>

      <h2 className="legal-h2">11. Termination</h2>
      <p className="legal-p">
        Either party may terminate these Terms at any time. You may cancel your account from your account
        settings. We may suspend or terminate your account immediately if you:
      </p>
      <ul className="legal-ul">
        <li>Violate any provision of these Terms or our Acceptable Use Policy</li>
        <li>Fail to pay fees when due</li>
        <li>Engage in fraudulent or illegal activity</li>
        <li>Create risk or legal exposure for PagerSchedule</li>
      </ul>
      <p className="legal-p">
        Upon termination, your right to use the Service ceases immediately. Your data will be retained for 30
        days after termination, after which it will be permanently deleted. You may request an export of your
        data before deletion by contacting{" "}
        <a href="mailto:support@pagerschedule.com" className="legal-a">
          support@pagerschedule.com
        </a>
        .
      </p>

      <h2 className="legal-h2">12. Changes to These Terms</h2>
      <p className="legal-p">
        We may update these Terms from time to time. Where changes are material, we will notify you by email
        at least 30 days before they take effect. Minor changes (such as clarifications or corrections) may be
        made without advance notice.
      </p>
      <p className="legal-p">
        Your continued use of the Service after changes take effect constitutes your acceptance of the updated
        Terms. If you do not agree to the updated Terms, you must stop using the Service and cancel your
        account.
      </p>

      <h2 className="legal-h2">13. Governing Law and Disputes</h2>
      <p className="legal-p">
        These Terms are governed by and construed in accordance with the laws of England and Wales. Any
        disputes arising from or relating to these Terms or your use of the Service shall be subject to the
        exclusive jurisdiction of the courts of England and Wales.
      </p>
      <p className="legal-p">
        If you are a consumer resident in another jurisdiction, you may also have rights under the mandatory
        consumer protection laws of your country of residence.
      </p>

      <h2 className="legal-h2">14. Miscellaneous</h2>
      <ul className="legal-ul">
        <li>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will continue
          in full force
        </li>
        <li>Our failure to enforce any right does not constitute a waiver of that right</li>
        <li>
          These Terms constitute the entire agreement between you and PagerSchedule regarding the Service
        </li>
        <li>You may not assign your rights under these Terms without our consent</li>
      </ul>

      <h2 className="legal-h2">15. Contact</h2>
      <p className="legal-p">If you have any questions about these Terms, please contact us:</p>
      <ul className="legal-ul">
        <li>
          Email:{" "}
          <a href="mailto:legal@pagerschedule.com" className="legal-a">
            legal@pagerschedule.com
          </a>
        </li>
        <li>
          Website:{" "}
          <a href="https://pagerschedule.com" className="legal-a">
            pagerschedule.com
          </a>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
