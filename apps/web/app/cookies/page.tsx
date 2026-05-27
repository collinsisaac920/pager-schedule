import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Cookie Policy — PagerSchedule",
  description: "How PagerSchedule uses cookies and similar tracking technologies.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          This Cookie Policy explains how PagerSchedule uses cookies and similar tracking technologies when
          you visit our website and use our scheduling platform.
        </p>
      </div>

      <h2 className="legal-h2">1. What Are Cookies?</h2>
      <p className="legal-p">
        Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you
        visit a website. They are widely used to make websites work efficiently, to remember your preferences,
        and to provide information to website owners.
      </p>
      <p className="legal-p">
        Cookies can be &ldquo;session cookies&rdquo; (deleted when you close your browser) or
        &ldquo;persistent cookies&rdquo; (which remain on your device for a set period or until you delete
        them). They can be set by the website you are visiting (&ldquo;first-party cookies&rdquo;) or by
        third-party services used on that site (&ldquo;third-party cookies&rdquo;).
      </p>

      <h2 className="legal-h2">2. Cookies We Use</h2>

      <h3 className="legal-h3">Essential Cookies (Required — Cannot Be Disabled)</h3>
      <p className="legal-p">
        These cookies are necessary for PagerSchedule to function. Without them, you cannot log in or use the
        scheduling features. They do not track you for advertising purposes.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>next-auth.session-token</code>
            </td>
            <td>Keeps you logged in to your account</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>
              <code>next-auth.csrf-token</code>
            </td>
            <td>Protects against cross-site request forgery (CSRF) attacks</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>__Secure-next-auth.session-token</code>
            </td>
            <td>Secure version of session token (HTTPS connections)</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>
              <code>__Host-next-auth.csrf-token</code>
            </td>
            <td>Secure CSRF protection token</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>next-auth.callback-url</code>
            </td>
            <td>Remembers where to redirect you after login</td>
            <td>Session</td>
          </tr>
          <tr>
            <td>
              <code>cal-timezone-dialog-shown</code>
            </td>
            <td>Remembers if you have dismissed the timezone notice</td>
            <td>1 year</td>
          </tr>
        </tbody>
      </table>

      <h3 className="legal-h3">Analytics Cookies (Optional — Opt-Out Available)</h3>
      <p className="legal-p">
        These cookies help us understand how people use PagerSchedule so we can improve it. They collect
        aggregate, anonymised information and cannot be used to identify you personally.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>ph_distinct_id</code>
            </td>
            <td>PostHog</td>
            <td>Anonymously tracks how features are used to help us improve the product</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td>
              <code>ph_ses_id</code>
            </td>
            <td>PostHog</td>
            <td>Session identifier for analytics grouping</td>
            <td>30 minutes</td>
          </tr>
          <tr>
            <td>
              <code>posthog-opted-in</code>
            </td>
            <td>PostHog</td>
            <td>Records your analytics opt-in/opt-out preference</td>
            <td>1 year</td>
          </tr>
        </tbody>
      </table>

      <h3 className="legal-h3">Monitoring Cookies</h3>
      <p className="legal-p">
        These cookies are set by our error monitoring service to help us detect and fix bugs that affect your
        experience.
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Cookie Name</th>
            <th>Provider</th>
            <th>Purpose</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sentry-sc</code>
            </td>
            <td>Sentry</td>
            <td>Error tracking and performance monitoring session context</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>

      <h2 className="legal-h2">3. What We Do Not Use Cookies For</h2>
      <p className="legal-p">We do not use cookies for:</p>
      <ul className="legal-ul">
        <li>Advertising or retargeting purposes</li>
        <li>Selling or sharing your data with advertisers</li>
        <li>Tracking you across other websites</li>
        <li>Building advertising profiles</li>
      </ul>
      <p className="legal-p">
        Your booking pages — the pages shared with your clients — do not set any tracking cookies on your
        visitors.
      </p>

      <h2 className="legal-h2">4. How to Control and Delete Cookies</h2>

      <h3 className="legal-h3">Browser Settings</h3>
      <p className="legal-p">
        You can control and delete cookies through your browser settings. Please note that disabling essential
        cookies will prevent you from logging in to PagerSchedule.
      </p>
      <ul className="legal-ul">
        <li>
          <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data
        </li>
        <li>
          <strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
        </li>
        <li>
          <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
        </li>
        <li>
          <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
        </li>
      </ul>
      <p className="legal-p">
        For more information about managing cookies across all browsers, visit{" "}
        <a
          href="https://www.allaboutcookies.org"
          className="legal-a"
          target="_blank"
          rel="noopener noreferrer">
          allaboutcookies.org
        </a>
        .
      </p>

      <h3 className="legal-h3">Opt Out of Analytics</h3>
      <p className="legal-p">
        You can opt out of PostHog analytics at any time. To do so, you can use the cookie preference controls
        in our application settings, or contact us at{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>{" "}
        and we will process your opt-out request.
      </p>

      <h2 className="legal-h2">5. Third-Party Links</h2>
      <p className="legal-p">
        Our website may contain links to third-party websites. Once you click on those links, you leave our
        site and their cookie policies apply. We are not responsible for the cookies or privacy practices of
        third-party websites.
      </p>

      <h2 className="legal-h2">6. Changes to This Policy</h2>
      <p className="legal-p">
        We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for
        other operational, legal, or regulatory reasons. Please check back periodically to stay informed.
        Material changes will be communicated via email.
      </p>

      <h2 className="legal-h2">7. Contact</h2>
      <p className="legal-p">If you have any questions about how we use cookies, please contact us:</p>
      <ul className="legal-ul">
        <li>
          Email:{" "}
          <a href="mailto:legal@pagerschedule.com" className="legal-a">
            legal@pagerschedule.com
          </a>
        </li>
        <li>
          Privacy Policy:{" "}
          <a href="/privacy" className="legal-a">
            pagerschedule.com/privacy
          </a>
        </li>
      </ul>
    </LegalPageLayout>
  );
}
