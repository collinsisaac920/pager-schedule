import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Service Level Agreement — PagerSchedule",
  description: "PagerSchedule uptime commitments, service credits, and support response times.",
};

export default function SlaPage() {
  return (
    <LegalPageLayout title="Service Level Agreement">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          This Service Level Agreement (&ldquo;SLA&rdquo;) sets out PagerSchedule&apos;s commitments regarding
          uptime, performance, and support response times for paid subscribers. The SLA does not apply to free
          plan users.
        </p>
      </div>

      <h2 className="legal-h2">1. Overview</h2>
      <p className="legal-p">
        PagerSchedule is committed to providing a reliable, high-availability scheduling platform. This SLA
        defines the uptime targets we commit to, what happens when we fall short, and how you can claim
        service credits. Enterprise customers receive enhanced commitments as described below.
      </p>

      <h2 className="legal-h2">2. Uptime Commitments</h2>
      <p className="legal-p">&ldquo;Monthly Uptime Percentage&rdquo; is calculated as:</p>
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0, fontFamily: "monospace" }}>
          Monthly Uptime % = (Total minutes in month − Downtime minutes) ÷ Total minutes × 100
        </p>
      </div>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Monthly Uptime Target</th>
            <th>Maximum Downtime per Month</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free</td>
            <td>Best effort (no SLA)</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>99.9%</td>
            <td>~43 minutes</td>
          </tr>
          <tr>
            <td>Team</td>
            <td>99.9%</td>
            <td>~43 minutes</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>99.99%</td>
            <td>~4 minutes</td>
          </tr>
        </tbody>
      </table>

      <p className="legal-p">
        &ldquo;Downtime&rdquo; means the period during which the PagerSchedule core scheduling functionality
        (creating and viewing bookings) is unavailable to all users, as confirmed by our monitoring systems.
        Partial degradation of non-core features is not counted as downtime for SLA purposes.
      </p>

      <h2 className="legal-h2">3. Exclusions</h2>
      <p className="legal-p">The following do not count as downtime for SLA calculation purposes:</p>
      <ul className="legal-ul">
        <li>
          <strong>Scheduled maintenance:</strong> Planned maintenance windows announced at least 24 hours in
          advance via our status page and email
        </li>
        <li>
          <strong>Force majeure:</strong> Events beyond our reasonable control, including natural disasters,
          acts of government, power outages, internet backbone failures, or cyberattacks of extraordinary
          scale
        </li>
        <li>
          <strong>Third-party service failures:</strong> Outages of services you have integrated with (Google
          Calendar, Zoom, Outlook, Stripe, etc.) that are outside our control
        </li>
        <li>
          <strong>User-caused issues:</strong> Downtime resulting from your actions, your configurations, or
          third-party integrations you have installed
        </li>
        <li>
          <strong>Emergency security measures:</strong> Brief outages required to protect the security or
          integrity of the platform
        </li>
        <li>
          <strong>Beta features:</strong> Features designated as &ldquo;beta&rdquo; or &ldquo;preview&rdquo;
          are excluded from SLA coverage
        </li>
      </ul>

      <h2 className="legal-h2">4. Service Credits</h2>
      <p className="legal-p">
        If we fail to meet the applicable uptime target in any calendar month, you are entitled to service
        credits applied to your next invoice.
      </p>

      <h3 className="legal-h3">Pro and Team Plans</h3>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Monthly Uptime Achieved</th>
            <th>Service Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>99.0% – 99.9%</td>
            <td>10% of that month&apos;s fee</td>
          </tr>
          <tr>
            <td>95.0% – 99.0%</td>
            <td>25% of that month&apos;s fee</td>
          </tr>
          <tr>
            <td>Below 95.0%</td>
            <td>50% of that month&apos;s fee</td>
          </tr>
        </tbody>
      </table>

      <h3 className="legal-h3">Enterprise Plan</h3>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Monthly Uptime Achieved</th>
            <th>Service Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>99.5% – 99.99%</td>
            <td>10% of that month&apos;s fee</td>
          </tr>
          <tr>
            <td>99.0% – 99.5%</td>
            <td>25% of that month&apos;s fee</td>
          </tr>
          <tr>
            <td>Below 99.0%</td>
            <td>50% of that month&apos;s fee</td>
          </tr>
        </tbody>
      </table>

      <p className="legal-p">
        Service credits are your sole and exclusive remedy for uptime failures. Credits do not convert to cash
        and cannot exceed the total fees paid in the relevant month.
      </p>

      <h2 className="legal-h2">5. How to Claim a Service Credit</h2>
      <ol className="legal-ol">
        <li>
          Email{" "}
          <a href="mailto:support@pagerschedule.com" className="legal-a">
            support@pagerschedule.com
          </a>{" "}
          with the subject line &ldquo;SLA Credit Request&rdquo;
        </li>
        <li>Include the dates and times of the downtime incidents you are claiming for</li>
        <li>Submit your claim within 7 days of the end of the affected calendar month</li>
      </ol>
      <p className="legal-p">
        We will verify the claim against our monitoring data and apply any applicable credits to your next
        invoice within 14 business days of receiving your claim.
      </p>

      <h2 className="legal-h2">6. Support Response Times</h2>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Support Channel</th>
            <th>Response Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Free</td>
            <td>Community forum and documentation</td>
            <td>Best effort</td>
          </tr>
          <tr>
            <td>Pro</td>
            <td>Email</td>
            <td>Within 24 hours (business days)</td>
          </tr>
          <tr>
            <td>Team</td>
            <td>Email (priority queue)</td>
            <td>Within 8 hours (business days)</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>Email</td>
            <td>Within 1 hour (business days)</td>
          </tr>
          <tr>
            <td>Enterprise</td>
            <td>Phone / dedicated Slack channel</td>
            <td>During agreed business hours</td>
          </tr>
        </tbody>
      </table>

      <p className="legal-p">
        &ldquo;Business days&rdquo; means Monday to Friday, excluding English public holidays. Response times
        apply to initial acknowledgement, not necessarily resolution.
      </p>

      <h2 className="legal-h2">7. Planned Maintenance</h2>
      <p className="legal-p">
        We will provide at least 24 hours&apos; advance notice of planned maintenance windows via our status
        page at{" "}
        <a href="/status" className="legal-a">
          pagerschedule.com/status
        </a>{" "}
        and by email to affected account holders.
      </p>
      <p className="legal-p">
        We aim to schedule maintenance outside of peak business hours (generally between 02:00 and 06:00 UTC
        on weekdays, or at weekends) to minimise disruption. Emergency maintenance may be performed without
        advance notice where necessary to protect security or platform integrity.
      </p>

      <h2 className="legal-h2">8. Status Page and Incident Communication</h2>
      <p className="legal-p">
        Our real-time status page is available at{" "}
        <a href="/status" className="legal-a">
          pagerschedule.com/status
        </a>
        . You can subscribe to status updates to receive notifications by email when incidents are created,
        updated, or resolved.
      </p>
      <p className="legal-p">
        During incidents, we will post updates at regular intervals (at minimum every 30 minutes for major
        incidents) until the incident is resolved.
      </p>

      <h2 className="legal-h2">9. Uptime Monitoring</h2>
      <p className="legal-p">
        We monitor service availability from multiple geographic locations every 5 minutes. Our monitoring
        infrastructure runs independently of our production systems to ensure accurate detection. Downtime is
        confirmed when monitoring checks fail from multiple locations simultaneously.
      </p>
    </LegalPageLayout>
  );
}
