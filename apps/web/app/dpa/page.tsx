import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Data Processing Agreement — PagerSchedule",
  description: "PagerSchedule Data Processing Agreement (DPA) for enterprise and business customers.",
};

export default function DpaPage() {
  return (
    <LegalPageLayout title="Data Processing Agreement">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the agreement between PagerSchedule
          and business or enterprise customers where PagerSchedule processes personal data on their behalf. To
          execute this DPA for your organisation, email us at{" "}
          <a href="mailto:legal@pagerschedule.com" className="legal-a">
            legal@pagerschedule.com
          </a>
          .
        </p>
      </div>

      <h2 className="legal-h2">1. Introduction and Scope</h2>
      <p className="legal-p">
        This DPA applies when PagerSchedule acts as a data processor on behalf of enterprise and business
        customers (the &ldquo;Controller&rdquo;) in connection with the PagerSchedule scheduling service. It
        sets out the terms under which we process personal data on your behalf in accordance with UK GDPR and
        EU GDPR Article 28.
      </p>
      <p className="legal-p">
        This DPA supplements and is incorporated into the PagerSchedule{" "}
        <a href="/terms" className="legal-a">
          Terms of Service
        </a>
        . In the event of any conflict between this DPA and the Terms of Service, this DPA shall take
        precedence with respect to data processing matters.
      </p>

      <h2 className="legal-h2">2. Definitions</h2>
      <ul className="legal-ul">
        <li>
          <strong>Controller:</strong> The enterprise or business customer — you — who determines the purposes
          and means of processing personal data
        </li>
        <li>
          <strong>Processor:</strong> PagerSchedule, who processes personal data on behalf of the Controller
        </li>
        <li>
          <strong>Data subjects:</strong> The individuals whose personal data is processed, including your
          employees, team members, and meeting attendees
        </li>
        <li>
          <strong>Personal data:</strong> Any information relating to an identified or identifiable natural
          person, including names, email addresses, and meeting information
        </li>
        <li>
          <strong>Processing:</strong> Any operation performed on personal data, such as storing, accessing,
          transmitting, or deleting it
        </li>
        <li>
          <strong>Sub-processor:</strong> Any third party engaged by PagerSchedule to process personal data in
          connection with the Service
        </li>
        <li>
          <strong>GDPR:</strong> UK GDPR and/or EU General Data Protection Regulation 2016/679
        </li>
      </ul>

      <h2 className="legal-h2">3. Processing Details</h2>

      <table className="legal-table">
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, width: "35%" }}>Subject matter</td>
            <td>Provision of online scheduling and booking services</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Duration</td>
            <td>
              For the duration of the subscription agreement, plus any retention periods specified in this DPA
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Nature of processing</td>
            <td>
              Storing, retrieving, displaying, transmitting, and deleting booking information and user data
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Purpose</td>
            <td>
              Providing scheduling tools to enable the Controller&apos;s employees and clients to book
              meetings
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Types of data</td>
            <td>
              Names, email addresses, phone numbers (if provided), meeting titles and descriptions, meeting
              times, location or video call links, booking form responses
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Categories of data subjects</td>
            <td>
              Employees, clients, contractors, and any other meeting attendees whose data is entered into the
              Service
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="legal-h2">4. PagerSchedule&apos;s Obligations as Processor</h2>
      <p className="legal-p">PagerSchedule agrees to:</p>
      <ul className="legal-ul">
        <li>
          Process personal data only on documented instructions from the Controller (your use of the Service
          constitutes such instructions), unless required otherwise by applicable law
        </li>
        <li>
          Ensure that all personnel with access to personal data are subject to binding confidentiality
          obligations
        </li>
        <li>
          Implement and maintain appropriate technical and organisational security measures as described in
          Section 6
        </li>
        <li>
          Assist the Controller in responding to data subject rights requests within 5 business days of
          notification
        </li>
        <li>
          Assist the Controller with data protection impact assessments (DPIAs) and prior consultations where
          requested
        </li>
        <li>
          Delete or return all personal data upon termination of the agreement, as described in Section 9
        </li>
        <li>
          Provide all information necessary to demonstrate compliance with this DPA and permit and contribute
          to audits conducted by the Controller or a mandated auditor
        </li>
        <li>
          Notify the Controller without undue delay (and within 72 hours) of becoming aware of a personal data
          breach affecting the Controller&apos;s data
        </li>
        <li>
          Not engage sub-processors without the Controller&apos;s prior general consent (which is granted by
          acceptance of this DPA, subject to the notification requirements in Section 5)
        </li>
      </ul>

      <h2 className="legal-h2">5. Sub-processors</h2>
      <p className="legal-p">
        The Controller provides general authorisation for PagerSchedule to engage the following
        sub-processors:
      </p>

      <table className="legal-table">
        <thead>
          <tr>
            <th>Sub-processor</th>
            <th>Location</th>
            <th>Purpose</th>
            <th>DPA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vercel</td>
            <td>EU / US</td>
            <td>Hosting and deployment infrastructure</td>
            <td>
              <a
                href="https://vercel.com/legal/dpa"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>Neon / Vercel Postgres</td>
            <td>European Union</td>
            <td>Primary database storage</td>
            <td>
              <a href="https://neon.tech/dpa" className="legal-a" target="_blank" rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>EU / US</td>
            <td>Transactional email (confirmations, reminders)</td>
            <td>
              <a
                href="https://resend.com/legal/dpa"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>Sentry</td>
            <td>EU / US</td>
            <td>Error monitoring (may include limited request data)</td>
            <td>
              <a
                href="https://sentry.io/legal/dpa/"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>PostHog</td>
            <td>European Union</td>
            <td>Product analytics (anonymised usage data)</td>
            <td>
              <a href="https://posthog.com/dpa" className="legal-a" target="_blank" rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>Twilio</td>
            <td>United States</td>
            <td>SMS notifications and reminders</td>
            <td>
              <a
                href="https://www.twilio.com/legal/data-protection-addendum"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>EU / US</td>
            <td>Payment processing (billing data only)</td>
            <td>
              <a
                href="https://stripe.com/legal/dpa"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>OpenAI</td>
            <td>United States</td>
            <td>AI scheduling assistance features</td>
            <td>
              <a
                href="https://openai.com/policies/data-processing-addendum"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View DPA
              </a>
            </td>
          </tr>
          <tr>
            <td>UptimeRobot</td>
            <td>EU / US</td>
            <td>Uptime monitoring (no personal data processed)</td>
            <td>
              <a
                href="https://uptimerobot.com/privacy/"
                className="legal-a"
                target="_blank"
                rel="noopener noreferrer">
                View Policy
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="legal-p">
        PagerSchedule will notify the Controller at least 30 days before adding any new sub-processor. The
        Controller may object to new sub-processors within that period. If a reasonable objection cannot be
        resolved, the Controller may terminate the agreement.
      </p>

      <h2 className="legal-h2">6. Technical and Organisational Security Measures</h2>

      <h3 className="legal-h3">Technical Measures</h3>
      <ul className="legal-ul">
        <li>Encryption of personal data in transit using TLS 1.2 or higher</li>
        <li>Encryption of personal data at rest using AES-256</li>
        <li>Passwords and credentials stored using one-way bcrypt hashing</li>
        <li>Access control mechanisms including role-based permissions</li>
        <li>Multi-factor authentication available for all accounts</li>
        <li>Regular automated database backups with encrypted storage</li>
        <li>Audit logging of administrative actions</li>
        <li>Rate limiting and DDoS protection</li>
        <li>Regular security updates applied to all system components</li>
      </ul>

      <h3 className="legal-h3">Organisational Measures</h3>
      <ul className="legal-ul">
        <li>Access to personal data limited to personnel who need it to perform their duties</li>
        <li>All staff subject to confidentiality obligations</li>
        <li>Security awareness training for all personnel</li>
        <li>Documented incident response procedures</li>
        <li>Regular review of access controls and permissions</li>
        <li>Vendor risk assessments for all sub-processors</li>
      </ul>

      <h2 className="legal-h2">7. Data Subject Rights</h2>
      <p className="legal-p">
        PagerSchedule will assist the Controller in responding to data subject rights requests. When we
        receive a request directly from a data subject that relates to your organisation&apos;s data, we will
        forward it to you within 2 business days. We will provide technical assistance to fulfil such requests
        within 5 business days of your instruction.
      </p>
      <p className="legal-p">
        Controllers can manage much of this directly: account holders can export or delete their data from
        Settings, or request assistance from{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        .
      </p>

      <h2 className="legal-h2">8. Data Breach Notification</h2>
      <p className="legal-p">
        In the event of a personal data breach affecting your data, PagerSchedule will:
      </p>
      <ul className="legal-ul">
        <li>Notify you without undue delay, and within 72 hours of becoming aware of the breach</li>
        <li>
          Provide a description of the nature of the breach including the categories and approximate number of
          data subjects and records affected
        </li>
        <li>Provide the name and contact details of our data protection contact</li>
        <li>Describe the likely consequences of the breach</li>
        <li>Describe the measures taken or proposed to address the breach</li>
      </ul>
      <p className="legal-p">
        You are responsible for notifying your relevant supervisory authority and affected data subjects as
        required by applicable law.
      </p>

      <h2 className="legal-h2">9. Data Deletion on Termination</h2>
      <p className="legal-p">
        Upon termination of the agreement (whether by either party, or upon expiry), PagerSchedule will:
      </p>
      <ul className="legal-ul">
        <li>Cease all processing of your personal data</li>
        <li>Delete all personal data within 30 days of termination</li>
        <li>Provide written confirmation of deletion upon request</li>
        <li>Ensure sub-processors also delete relevant data</li>
      </ul>
      <p className="legal-p">
        Certain data may be retained for longer periods where required by applicable law (e.g. financial
        records). We will inform you of any such retention.
      </p>

      <h2 className="legal-h2">10. Governing Law</h2>
      <p className="legal-p">
        This DPA is governed by the laws of England and Wales. Any disputes arising from this DPA shall be
        subject to the exclusive jurisdiction of the courts of England and Wales, subject to any mandatory
        provisions of applicable data protection law.
      </p>

      <h2 className="legal-h2">11. How to Execute This DPA</h2>
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          To receive a countersigned DPA for your organisation, email{" "}
          <a href="mailto:legal@pagerschedule.com" className="legal-a">
            legal@pagerschedule.com
          </a>{" "}
          with your company name and registered address. We will respond with a signed copy within 5 business
          days.
        </p>
      </div>
    </LegalPageLayout>
  );
}
