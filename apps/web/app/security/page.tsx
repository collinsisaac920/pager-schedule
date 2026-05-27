import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Security — PagerSchedule",
  description: "How PagerSchedule protects your data with industry-standard security measures.",
};

export default function SecurityPage() {
  return (
    <LegalPageLayout title="Security Policy">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          Security is foundational to PagerSchedule. We protect your scheduling data with industry-standard
          technical and organisational measures. This page describes our security practices in detail.
        </p>
      </div>

      <h2 className="legal-h2">1. Our Commitment</h2>
      <p className="legal-p">
        We believe that scheduling software handles sensitive professional information — who you meet, when,
        and why. We take this responsibility seriously. Our security programme is designed to protect your
        data from unauthorised access, disclosure, alteration, and destruction.
      </p>
      <p className="legal-p">
        We continuously review and improve our security posture. All security measures described here are
        active protections in production.
      </p>

      <h2 className="legal-h2">2. Infrastructure Security</h2>

      <h3 className="legal-h3">Hosting</h3>
      <ul className="legal-ul">
        <li>
          PagerSchedule is hosted on <strong>Vercel</strong>, which maintains SOC 2 Type II certification and
          implements comprehensive physical and logical security controls
        </li>
        <li>Our database runs on enterprise-grade PostgreSQL infrastructure in the European Union</li>
        <li>All infrastructure is isolated within private networks with controlled ingress and egress</li>
      </ul>

      <h3 className="legal-h3">Network Security</h3>
      <ul className="legal-ul">
        <li>DDoS protection via Vercel&apos;s global edge network</li>
        <li>Web Application Firewall (WAF) for protection against common web attacks</li>
        <li>Rate limiting applied at the edge to prevent abuse</li>
        <li>All external-facing services run exclusively over HTTPS</li>
        <li>Security headers applied on all responses (HSTS, CSP, X-Frame-Options, etc.)</li>
      </ul>

      <h3 className="legal-h3">Data Location</h3>
      <ul className="legal-ul">
        <li>Primary data storage located within the European Union</li>
        <li>Data at rest does not leave EU infrastructure without appropriate safeguards</li>
        <li>
          Some sub-processors process data outside the EU — see our{" "}
          <a href="/privacy" className="legal-a">
            Privacy Policy
          </a>{" "}
          for details
        </li>
      </ul>

      <h2 className="legal-h2">3. Data Encryption</h2>

      <h3 className="legal-h3">Data in Transit</h3>
      <ul className="legal-ul">
        <li>
          All communications between your browser and PagerSchedule are encrypted using TLS 1.2 or higher
        </li>
        <li>
          TLS 1.0 and 1.1 are disabled. We regularly review and update our cipher suites to use only strong,
          modern algorithms
        </li>
        <li>HSTS (HTTP Strict Transport Security) is enforced to prevent downgrade attacks</li>
      </ul>

      <h3 className="legal-h3">Data at Rest</h3>
      <ul className="legal-ul">
        <li>All data stored in our database is encrypted at rest using AES-256</li>
        <li>Database encryption keys are managed separately from the data they protect</li>
        <li>Backups are encrypted before storage</li>
      </ul>

      <h3 className="legal-h3">Sensitive Credentials</h3>
      <ul className="legal-ul">
        <li>
          Passwords are hashed using bcrypt with a high work factor — they are mathematically irreversible and
          never stored in plain text
        </li>
        <li>API keys and calendar OAuth tokens are encrypted in the database using AES-256 before storage</li>
        <li>Two-factor authentication backup codes are stored encrypted</li>
      </ul>

      <h2 className="legal-h2">4. Authentication Security</h2>
      <ul className="legal-ul">
        <li>
          <strong>Two-factor authentication (2FA):</strong> Available for all accounts via authenticator app
          (TOTP), email code, or SMS. We strongly recommend enabling 2FA
        </li>
        <li>
          <strong>Account lockout:</strong> Accounts are automatically locked after repeated failed login
          attempts to prevent brute-force attacks
        </li>
        <li>
          <strong>Secure session management:</strong> Sessions are cryptographically signed, expire
          automatically, and are invalidated on logout or password change
        </li>
        <li>
          <strong>OAuth 2.0:</strong> Social login (Google, Microsoft) uses industry-standard OAuth 2.0 flows.
          We never see or store your Google or Microsoft password
        </li>
        <li>
          <strong>CSRF protection:</strong> All state-changing requests are protected against cross-site
          request forgery
        </li>
        <li>
          <strong>Secure cookies:</strong> Session tokens are set with HttpOnly, Secure, and SameSite
          attributes
        </li>
      </ul>

      <h2 className="legal-h2">5. Application Security</h2>
      <ul className="legal-ul">
        <li>
          <strong>SQL injection prevention:</strong> All database queries use parameterised statements via
          Prisma ORM — raw SQL is never constructed from user input
        </li>
        <li>
          <strong>XSS protection:</strong> User-generated content is sanitised and escaped before rendering.
          Content Security Policy headers restrict script execution
        </li>
        <li>
          <strong>Input validation:</strong> All API inputs are validated and type-checked using Zod schema
          validation before processing
        </li>
        <li>
          <strong>Rate limiting:</strong> API endpoints are rate-limited to prevent abuse and
          denial-of-service attempts
        </li>
        <li>
          <strong>Dependency management:</strong> We monitor dependencies for known vulnerabilities using
          automated scanning tools and apply security patches promptly
        </li>
        <li>
          <strong>Security headers:</strong> Comprehensive HTTP security headers are applied to all responses
        </li>
      </ul>

      <h2 className="legal-h2">6. Access Controls</h2>
      <ul className="legal-ul">
        <li>Role-based access control (RBAC) restricts what each user can see and do</li>
        <li>
          Team members can only access data within their team — cross-team data access is blocked at the
          application layer
        </li>
        <li>
          All administrative actions (account changes, data exports, team management) are recorded in audit
          logs
        </li>
        <li>
          PagerSchedule employee access to production systems follows the principle of least privilege — staff
          only have access to the minimum data needed for their role
        </li>
        <li>Production access is subject to multi-factor authentication</li>
        <li>Access privileges are reviewed and revoked when no longer required</li>
      </ul>

      <h2 className="legal-h2">7. Monitoring and Incident Response</h2>
      <ul className="legal-ul">
        <li>
          <strong>24/7 error monitoring:</strong> All application errors are captured and alerted via Sentry,
          with automated escalation for critical issues
        </li>
        <li>
          <strong>Uptime monitoring:</strong> Service availability is checked every 5 minutes from multiple
          geographic locations
        </li>
        <li>
          <strong>Anomaly detection:</strong> Unusual access patterns, login spikes, and suspicious activity
          trigger automated alerts
        </li>
        <li>
          <strong>Incident response plan:</strong> We maintain a documented security incident response
          procedure with defined escalation paths and communication timelines
        </li>
        <li>
          <strong>Data breach notification:</strong> In the event of a breach affecting your data, we will
          notify you within 72 hours as required by GDPR
        </li>
      </ul>

      <h2 className="legal-h2">8. Backup and Recovery</h2>
      <ul className="legal-ul">
        <li>Automated database backups run daily</li>
        <li>Backups are retained for 30 days</li>
        <li>All backups are encrypted before storage</li>
        <li>Backup restoration is tested regularly to verify integrity</li>
        <li>Our recovery time objective (RTO) for major incidents is 4 hours</li>
        <li>Our recovery point objective (RPO) is 24 hours (maximum data loss in a worst-case scenario)</li>
      </ul>

      <h2 className="legal-h2">9. Responsible Vulnerability Disclosure</h2>
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: "8px" }}>
          <strong>Found a security issue?</strong>
        </p>
        <p className="legal-p" style={{ marginBottom: 0 }}>
          Please report it to{" "}
          <a href="mailto:security@pagerschedule.com" className="legal-a">
            security@pagerschedule.com
          </a>
          . We aim to acknowledge all reports within 24 hours and provide a remediation timeline within 5
          business days.
        </p>
      </div>
      <p className="legal-p">We ask that you:</p>
      <ul className="legal-ul">
        <li>Give us reasonable time to investigate and fix the issue before public disclosure</li>
        <li>Do not access or modify data that does not belong to you</li>
        <li>Do not perform denial-of-service testing</li>
        <li>Act in good faith</li>
      </ul>
      <p className="legal-p">
        We do not pursue legal action against researchers who act in good faith in accordance with this
        policy. We are committed to working collaboratively with the security community to keep PagerSchedule
        secure.
      </p>

      <h2 className="legal-h2">10. Compliance and Certifications</h2>
      <ul className="legal-ul">
        <li>
          <strong>GDPR compliant:</strong> We comply with the EU General Data Protection Regulation and UK
          GDPR — see our{" "}
          <a href="/privacy" className="legal-a">
            Privacy Policy
          </a>
        </li>
        <li>
          <strong>SOC 2:</strong> We are working towards SOC 2 Type II certification. Our infrastructure
          provider (Vercel) is SOC 2 Type II certified
        </li>
        <li>
          <strong>Encryption standards:</strong> We follow NIST guidelines for cryptographic standards
        </li>
      </ul>
      <p className="legal-p">
        Enterprise customers may request our security questionnaire or data processing addendum by emailing{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
