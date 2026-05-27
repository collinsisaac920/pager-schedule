import LegalPageLayout from "@components/legal/LegalPageLayout";

export const metadata = {
  title: "Refund Policy — PagerSchedule",
  description: "PagerSchedule refund policy including our 30-day money-back guarantee.",
};

export default function RefundsPage() {
  return (
    <LegalPageLayout title="Refund Policy">
      <div className="legal-box">
        <p className="legal-p" style={{ marginBottom: 0 }}>
          We want you to be completely satisfied with PagerSchedule. If you are not, we offer a
          no-questions-asked 30-day money-back guarantee on your first payment.
        </p>
      </div>

      <h2 className="legal-h2">1. 30-Day Money-Back Guarantee</h2>
      <p className="legal-p">
        New paid subscribers can request a full refund within 30 days of their first subscription payment — no
        questions asked. This guarantee exists because we are confident in PagerSchedule and want you to be
        able to try it without financial risk.
      </p>
      <p className="legal-p">
        The 30-day guarantee applies to your <strong>first payment only</strong>. It covers both monthly and
        annual plans.
      </p>

      <h2 className="legal-h2">2. How to Request a Refund</h2>
      <ol className="legal-ol">
        <li>
          Email{" "}
          <a href="mailto:support@pagerschedule.com" className="legal-a">
            support@pagerschedule.com
          </a>{" "}
          with the subject line <strong>Refund Request</strong>
        </li>
        <li>Include the email address associated with your PagerSchedule account</li>
        <li>You do not need to provide a reason, but any feedback you share helps us improve</li>
      </ol>
      <p className="legal-p">
        We will acknowledge your request within 1 business day and process the refund within 5 business days.
        The funds will be returned to your original payment method.
      </p>

      <h2 className="legal-h2">3. Refund Eligibility</h2>

      <h3 className="legal-h3">Eligible for Full Refund</h3>
      <ul className="legal-ul">
        <li>First payment on a paid plan (monthly or annual)</li>
        <li>Requested within 30 days of the payment date</li>
        <li>Account is in good standing (not suspended for abuse or violation of Terms)</li>
      </ul>

      <h3 className="legal-h3">Not Eligible for Refund</h3>
      <ul className="legal-ul">
        <li>Subscription renewals (second payment onwards)</li>
        <li>Requests made more than 30 days after the first payment</li>
        <li>
          Accounts that have been suspended or terminated due to violations of our{" "}
          <a href="/terms" className="legal-a">
            Terms of Service
          </a>{" "}
          or{" "}
          <a href="/acceptable-use" className="legal-a">
            Acceptable Use Policy
          </a>
        </li>
        <li>Annual plan payments more than 30 days old (prorated credit may apply — see below)</li>
        <li>Payments for add-ons or one-time purchases</li>
      </ul>

      <h2 className="legal-h2">4. Annual Plans After 30 Days</h2>
      <p className="legal-p">
        If you have an annual plan and wish to cancel after the 30-day refund window has passed, we are unable
        to issue a cash refund. However, we will provide a prorated account credit for the remaining unused
        full months of your subscription.
      </p>
      <p className="legal-p">
        For example, if you have paid for an annual plan and cancel after 4 complete months, you would receive
        credit for the remaining 8 months. This credit can be applied to any future PagerSchedule
        subscription.
      </p>
      <p className="legal-p">
        To request a prorated credit, email{" "}
        <a href="mailto:support@pagerschedule.com" className="legal-a">
          support@pagerschedule.com
        </a>
        .
      </p>

      <h2 className="legal-h2">5. Monthly Plans After 30 Days</h2>
      <p className="legal-p">
        After the initial 30-day period, monthly subscriptions are non-refundable. If you cancel a monthly
        subscription, your access will continue until the end of the current billing period and will not
        auto-renew. We do not issue partial-month refunds.
      </p>

      <h2 className="legal-h2">6. Processing Time</h2>
      <p className="legal-p">Once we have approved your refund:</p>
      <ul className="legal-ul">
        <li>We will initiate the refund within 5 business days</li>
        <li>
          Depending on your bank or card provider, funds typically appear within 5–10 business days of
          initiation
        </li>
        <li>Some banks may take up to 14 days to post the credit to your account</li>
      </ul>
      <p className="legal-p">
        Refunds are issued to the original payment method. If your original payment method is no longer
        available (e.g. a cancelled card), please contact us and we will arrange an alternative.
      </p>

      <h2 className="legal-h2">7. Chargebacks and Disputes</h2>
      <p className="legal-p">
        If you believe there has been an error with your billing, please contact us at{" "}
        <a href="mailto:support@pagerschedule.com" className="legal-a">
          support@pagerschedule.com
        </a>{" "}
        before initiating a chargeback with your bank or card provider. We are committed to resolving any
        billing issues promptly and professionally.
      </p>
      <p className="legal-p">
        Initiating an unwarranted chargeback may result in the suspension of your account. We reserve the
        right to dispute chargebacks that do not meet our refund eligibility criteria.
      </p>

      <h2 className="legal-h2">8. Exceptions</h2>
      <p className="legal-p">
        We may make exceptions to this policy at our sole discretion in exceptional circumstances, such as
        extended service outages attributable to PagerSchedule. In such cases, service credits (as described
        in our{" "}
        <a href="/sla" className="legal-a">
          SLA
        </a>
        ) are the primary remedy. Cash refunds for outages will be considered on a case-by-case basis.
      </p>

      <h2 className="legal-h2">9. Contact</h2>
      <p className="legal-p">For any billing or refund questions:</p>
      <ul className="legal-ul">
        <li>
          Email:{" "}
          <a href="mailto:support@pagerschedule.com" className="legal-a">
            support@pagerschedule.com
          </a>
        </li>
        <li>Subject: &ldquo;Refund Request&rdquo; or &ldquo;Billing Question&rdquo;</li>
      </ul>
      <p className="legal-p">We aim to respond to all billing enquiries within 1 business day.</p>
    </LegalPageLayout>
  );
}
