import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy — PagerSchedule",
  description: "How PagerSchedule collects, uses, and protects your personal data. GDPR compliant.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          We take your privacy seriously. This policy explains how PagerSchedule collects, uses, and protects
          your personal data. We comply with the UK General Data Protection Regulation (UK GDPR) and the EU
          General Data Protection Regulation (EU GDPR).
        </p>
      </div>

      <h2 className="legal-h2">1. Introduction</h2>
      <p className="legal-p">
        PagerSchedule (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting the
        privacy and security of your personal information. This Privacy Policy describes how we collect and
        use personal data when you use our scheduling platform at{" "}
        <a href="https://pagerschedule.com" className="legal-a">
          pagerschedule.com
        </a>
        .
      </p>
      <p className="legal-p">
        We will only use your personal data in accordance with this policy. Please read it carefully. If you
        have questions, contact us at{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        .
      </p>

      <h2 className="legal-h2">2. Data Controller</h2>
      <p className="legal-p">PagerSchedule is the data controller responsible for your personal data.</p>
      <p className="legal-p">
        Contact:{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        <br />
        Website:{" "}
        <a href="https://pagerschedule.com" className="legal-a">
          pagerschedule.com
        </a>
      </p>

      <h2 className="legal-h2">3. Data We Collect</h2>

      <h3 className="legal-h3">Account Data</h3>
      <ul className="legal-ul">
        <li>Name and email address (required to create an account)</li>
        <li>Profile photo (optional)</li>
        <li>Password (stored in encrypted, hashed form — never readable by us)</li>
        <li>Timezone and language preferences</li>
        <li>Username and public profile information</li>
        <li>Connected calendar accounts (OAuth tokens stored encrypted)</li>
      </ul>

      <h3 className="legal-h3">Booking Data</h3>
      <ul className="legal-ul">
        <li>Meeting titles, descriptions, and notes</li>
        <li>Attendee names and email addresses</li>
        <li>Meeting times, durations, and locations</li>
        <li>Video call links (e.g. Zoom, Google Meet)</li>
        <li>Responses to booking form questions</li>
        <li>Cancellation and reschedule history</li>
      </ul>

      <h3 className="legal-h3">Usage Data</h3>
      <ul className="legal-ul">
        <li>Pages and features visited on PagerSchedule</li>
        <li>Device type, browser, and operating system</li>
        <li>IP address and approximate geographic location</li>
        <li>Referring website</li>
        <li>Session duration and interactions</li>
        <li>Error reports and performance data</li>
      </ul>

      <h3 className="legal-h3">Payment Data</h3>
      <ul className="legal-ul">
        <li>Billing name and address</li>
        <li>
          Payment method details (handled exclusively by Stripe — we never see or store card numbers or full
          payment credentials)
        </li>
        <li>Invoice and payment history</li>
      </ul>

      <h3 className="legal-h3">Communications Data</h3>
      <ul className="legal-ul">
        <li>Emails and messages you send to our support team</li>
        <li>Feedback and survey responses</li>
      </ul>

      <h2 className="legal-h2">4. How We Use Your Data</h2>
      <p className="legal-p">We use your personal data to:</p>
      <ul className="legal-ul">
        <li>Create and manage your account</li>
        <li>Provide the scheduling and booking service</li>
        <li>Send booking confirmations, reminders, and cancellation notifications</li>
        <li>Process payments and issue invoices</li>
        <li>Send product updates and feature announcements (opt-out available at any time)</li>
        <li>Improve the platform through product analytics</li>
        <li>Detect and prevent fraud, abuse, and security incidents</li>
        <li>Respond to your support enquiries</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="legal-h2">5. Legal Basis for Processing</h2>
      <p className="legal-p">Under UK GDPR and EU GDPR, we rely on the following legal bases:</p>
      <ul className="legal-ul">
        <li>
          <strong>Contract:</strong> Processing necessary to provide the Service you have signed up for —
          account management, bookings, payments
        </li>
        <li>
          <strong>Legitimate interests:</strong> Security monitoring, fraud prevention, product improvement,
          and ensuring the reliability of the Service
        </li>
        <li>
          <strong>Consent:</strong> Marketing emails and optional analytics tracking. You may withdraw consent
          at any time
        </li>
        <li>
          <strong>Legal obligation:</strong> Tax records, compliance with applicable laws, responding to
          lawful requests from authorities
        </li>
      </ul>

      <h2 className="legal-h2">6. Data Sharing and Sub-processors</h2>
      <p className="legal-p">
        We share your data only with trusted service providers (&ldquo;sub-processors&rdquo;) who process data
        on our behalf. We have data processing agreements with all sub-processors.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <a
                href="https://vercel.com/legal/privacy-policy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Vercel
              </a>
            </td>
            <td>Hosting and deployment</td>
            <td>EU / US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://neon.tech/privacy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Neon / Vercel Postgres
              </a>
            </td>
            <td>Database storage</td>
            <td>European Union</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://resend.com/legal/privacy-policy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Resend
              </a>
            </td>
            <td>Transactional email delivery</td>
            <td>EU / US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://sentry.io/privacy/"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Sentry
              </a>
            </td>
            <td>Error monitoring</td>
            <td>EU / US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://posthog.com/privacy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                PostHog
              </a>
            </td>
            <td>Product analytics</td>
            <td>EU</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://www.twilio.com/en-us/legal/privacy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Twilio
              </a>
            </td>
            <td>SMS notifications</td>
            <td>US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://stripe.com/gb/privacy"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                Stripe
              </a>
            </td>
            <td>Payment processing</td>
            <td>EU / US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://openai.com/privacy/"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                OpenAI
              </a>
            </td>
            <td>AI-powered scheduling features</td>
            <td>US</td>
          </tr>
          <tr>
            <td>
              <a
                href="https://uptimerobot.com/privacy/"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                UptimeRobot
              </a>
            </td>
            <td>Uptime monitoring</td>
            <td>EU / US</td>
          </tr>
        </tbody>
      </table>

      <p className="legal-p">
        <strong>We never sell your data.</strong> We never share your personal data with advertisers or any
        party for their own marketing purposes.
      </p>

      <h2 className="legal-h2">7. Data Retention</h2>
      <ul className="legal-ul">
        <li>
          <strong>Account data:</strong> Retained while your account is active. Deleted within 30 days of
          account deletion
        </li>
        <li>
          <strong>Booking data:</strong> Retained for 2 years from the date of the booking
        </li>
        <li>
          <strong>Usage and analytics data:</strong> Retained for 12 months
        </li>
        <li>
          <strong>Payment records:</strong> Retained for 7 years as required by tax law
        </li>
        <li>
          <strong>Backup data:</strong> Overwritten within 30 days after account deletion
        </li>
      </ul>
      <p className="legal-p">
        We may retain data for longer periods where required by law or for legitimate business purposes such
        as fraud prevention.
      </p>

      <h2 className="legal-h2">8. Your Rights Under GDPR</h2>
      <p className="legal-p">You have the following rights regarding your personal data:</p>
      <ul className="legal-ul">
        <li>
          <strong>Access:</strong> Request a copy of the data we hold about you. You can export most data
          directly from your account Settings
        </li>
        <li>
          <strong>Rectification:</strong> Correct inaccurate or incomplete data
        </li>
        <li>
          <strong>Erasure:</strong> Request deletion of your data. You can delete your account from Settings,
          or email us
        </li>
        <li>
          <strong>Restriction:</strong> Request that we restrict processing of your data in certain
          circumstances
        </li>
        <li>
          <strong>Objection:</strong> Object to processing based on legitimate interests
        </li>
        <li>
          <strong>Portability:</strong> Receive your data in a structured, machine-readable format
        </li>
        <li>
          <strong>Withdraw consent:</strong> Where processing is based on consent, withdraw it at any time
          without affecting prior processing
        </li>
      </ul>
      <p className="legal-p">
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        . We will respond within 30 days.
      </p>

      <h2 className="legal-h2">9. Cookies</h2>
      <p className="legal-p">
        We use cookies to operate the Service and understand how it is used. See our full{" "}
        <a href="/cookies" className="legal-a">
          Cookie Policy
        </a>{" "}
        for details on which cookies we use and how to control them.
      </p>

      <h2 className="legal-h2">10. International Data Transfers</h2>
      <p className="legal-p">
        Your data is primarily stored within the European Union. Some of our sub-processors (such as Twilio
        and OpenAI) process data in the United States. Where data is transferred outside the EU or UK, we
        ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) approved by
        the European Commission.
      </p>

      <h2 className="legal-h2">11. Security</h2>
      <p className="legal-p">
        We implement robust technical and organisational measures to protect your data:
      </p>
      <ul className="legal-ul">
        <li>All data encrypted in transit using TLS 1.2 or higher</li>
        <li>All data encrypted at rest using AES-256</li>
        <li>Passwords stored using bcrypt hashing — never stored in plain text</li>
        <li>Regular security audits and vulnerability assessments</li>
        <li>Role-based access controls and audit logs</li>
        <li>Two-factor authentication available for all accounts</li>
        <li>Account lockout after repeated failed login attempts</li>
      </ul>
      <p className="legal-p">
        See our full{" "}
        <a href="/security" className="legal-a">
          Security Policy
        </a>{" "}
        for more details.
      </p>

      <h2 className="legal-h2">12. Children&apos;s Privacy</h2>
      <p className="legal-p">
        PagerSchedule is not directed at or intended for use by children under the age of 16. We do not
        knowingly collect personal data from children. If we become aware that we have collected data from a
        child under 16, we will delete it promptly. If you believe we have inadvertently collected a
        child&apos;s data, please contact us at{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        .
      </p>

      <h2 className="legal-h2">13. Changes to This Policy</h2>
      <p className="legal-p">
        We may update this Privacy Policy from time to time. Where changes are material, we will notify you by
        email at least 30 days before they take effect. The current version of this policy is always available
        at{" "}
        <a href="/privacy" className="legal-a">
          pagerschedule.com/privacy
        </a>
        .
      </p>

      <h2 className="legal-h2">14. Contact and Complaints</h2>
      <p className="legal-p">For any privacy-related questions or concerns:</p>
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
      <p className="legal-p">
        If you are not satisfied with our response, you have the right to lodge a complaint with your national
        data protection authority. In the UK, this is the Information Commissioner&apos;s Office (ICO) at{" "}
        <a href="https://ico.org.uk" className="legal-a" target="_blank" rel="noopener noreferrer">
          ico.org.uk
        </a>
        . In the EU, you may contact the supervisory authority in your country of residence.
      </p>
    </LegalPageLayout>
  );
}
