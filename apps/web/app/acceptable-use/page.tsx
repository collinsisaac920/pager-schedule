import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Acceptable Use Policy — PagerSchedule",
  description: "Rules governing acceptable use of the PagerSchedule scheduling platform.",
};

export default function AcceptableUsePage() {
  return (
    <LegalPageLayout title="Acceptable Use Policy">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          This Acceptable Use Policy (&ldquo;AUP&rdquo;) sets out the rules that apply to everyone who uses
          PagerSchedule. It forms part of our{" "}
          <a href="/terms" className="legal-a">
            Terms of Service
          </a>
          . By using PagerSchedule, you agree to comply with this AUP.
        </p>
      </div>

      <h2 className="legal-h2">1. Overview</h2>
      <p className="legal-p">
        PagerSchedule is a scheduling platform used by professionals, teams, and businesses around the world.
        We want to ensure it remains a safe, reliable, and trustworthy platform for everyone. This policy sets
        out what is and is not allowed.
      </p>
      <p className="legal-p">
        These rules apply to your use of the PagerSchedule application, your public booking pages, any
        integrations you create, and any content you submit to the platform.
      </p>

      <h2 className="legal-h2">2. Prohibited Uses</h2>
      <p className="legal-p">You must not use PagerSchedule to:</p>

      <h3 className="legal-h3">Communication and Messaging</h3>
      <ul className="legal-ul">
        <li>
          Send spam, bulk unsolicited messages, or communications that violate applicable anti-spam laws
          (including the UK Privacy and Electronic Communications Regulations, EU Directive 2002/58/EC, and
          CAN-SPAM)
        </li>
        <li>Send commercial messages to individuals who have not consented to receive them</li>
        <li>Use automated tools to send mass communications to contacts without their consent</li>
      </ul>

      <h3 className="legal-h3">Harm and Harassment</h3>
      <ul className="legal-ul">
        <li>Harass, threaten, intimidate, stalk, bully, or harm any individual</li>
        <li>
          Defame, abuse, or discriminate against individuals based on protected characteristics including
          race, gender, sexual orientation, religion, disability, or nationality
        </li>
        <li>Incite violence or hatred against any person or group</li>
      </ul>

      <h3 className="legal-h3">Illegal and Harmful Activities</h3>
      <ul className="legal-ul">
        <li>Process illegal transactions, including the sale of illegal goods or services</li>
        <li>Facilitate money laundering, fraud, or other financial crimes</li>
        <li>Violate any applicable local, national, or international law or regulation</li>
        <li>Violate any third party&apos;s intellectual property, privacy, or other legal rights</li>
        <li>Promote or facilitate illegal activity of any kind</li>
      </ul>

      <h3 className="legal-h3">Technical Abuse</h3>
      <ul className="legal-ul">
        <li>
          Attempt to hack, probe, or gain unauthorised access to PagerSchedule systems, networks, or data
        </li>
        <li>
          Upload, transmit, or distribute malware, viruses, ransomware, or any other malicious or harmful code
        </li>
        <li>Scrape, harvest, or collect data from PagerSchedule without our prior written permission</li>
        <li>Circumvent any rate limiting, authentication, or access control measures</li>
        <li>
          Conduct denial-of-service attacks or otherwise attempt to disrupt or overload the platform or its
          infrastructure
        </li>
        <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
        <li>
          Use automated bots or scripts to interact with the platform in ways not permitted by our API
          documentation
        </li>
      </ul>

      <h3 className="legal-h3">Identity and Deception</h3>
      <ul className="legal-ul">
        <li>
          Impersonate any person or entity, including PagerSchedule employees, or misrepresent your
          affiliation with any person or entity
        </li>
        <li>Create accounts using false or misleading information</li>
        <li>Use another person&apos;s account without their authorisation</li>
      </ul>

      <h3 className="legal-h3">Data and Privacy</h3>
      <ul className="legal-ul">
        <li>
          Collect, store, or process personal data through PagerSchedule in violation of applicable data
          protection laws (GDPR, UK GDPR, CCPA, etc.)
        </li>
        <li>
          Use booking form questions to collect sensitive personal data (such as health information, financial
          data, or government ID numbers) without appropriate legal basis and safeguards
        </li>
        <li>Share or publicly post other users&apos; personal data without their consent</li>
      </ul>

      <h2 className="legal-h2">3. Booking Page Rules</h2>
      <p className="legal-p">
        Your public booking page is visible to anyone you share it with. Your booking page must not:
      </p>
      <ul className="legal-ul">
        <li>Contain illegal content of any kind</li>
        <li>Mislead or deceive visitors about the nature of the services being booked</li>
        <li>
          Collect personal data through booking form questions for purposes other than those disclosed to the
          person booking
        </li>
        <li>Display content that infringes third-party intellectual property rights</li>
        <li>Contain offensive, discriminatory, or threatening content</li>
        <li>Be used to conduct phishing or social engineering attacks</li>
        <li>Impersonate a legitimate business, service, or individual</li>
      </ul>

      <h2 className="legal-h2">4. API Usage</h2>
      <p className="legal-p">
        If you use the PagerSchedule API, you must also comply with our API terms. In addition to the above
        rules, API usage must not:
      </p>
      <ul className="legal-ul">
        <li>Exceed published rate limits or attempt to circumvent them</li>
        <li>
          Be used to build competing scheduling products or to re-sell PagerSchedule functionality without our
          written agreement
        </li>
        <li>Be used to access data belonging to other users</li>
      </ul>

      <h2 className="legal-h2">5. Enforcement</h2>
      <p className="legal-p">
        We take violations of this policy seriously. Depending on the severity and nature of the violation, we
        may:
      </p>
      <ul className="legal-ul">
        <li>Issue a formal warning</li>
        <li>Temporarily suspend your account while we investigate</li>
        <li>Remove specific content or disable specific features</li>
        <li>Permanently terminate your account without refund</li>
        <li>Report the activity to relevant law enforcement authorities or regulatory bodies</li>
        <li>Pursue legal action where appropriate</li>
      </ul>
      <p className="legal-p">
        Where practicable and appropriate, we will give you notice and an opportunity to respond before taking
        enforcement action. However, we reserve the right to act immediately in cases involving serious harm,
        illegal activity, or security threats.
      </p>

      <h2 className="legal-h2">6. Reporting Abuse</h2>
      <p className="legal-p">
        If you become aware of a violation of this policy — including spam, harassment, or illegal content —
        please report it to:
      </p>
      <ul className="legal-ul">
        <li>
          Email:{" "}
          <a href="mailto:abuse@pagerschedule.com" className="legal-a">
            abuse@pagerschedule.com
          </a>
        </li>
      </ul>
      <p className="legal-p">
        We investigate all reports and will take appropriate action. We may not be able to disclose the
        outcome of our investigation, but we take all reports seriously.
      </p>

      <h2 className="legal-h2">7. Changes to This Policy</h2>
      <p className="legal-p">
        We may update this Acceptable Use Policy from time to time. Material changes will be communicated by
        email with at least 30 days&apos; notice. Continued use of PagerSchedule after changes take effect
        constitutes your acceptance of the updated policy.
      </p>

      <h2 className="legal-h2">8. Contact</h2>
      <p className="legal-p">
        Questions about this policy? Contact us at{" "}
        <a href="mailto:legal@pagerschedule.com" className="legal-a">
          legal@pagerschedule.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
