import { APP_NAME } from "@calcom/lib/constants";
import BaseEmail from "./_base-email";

const PROVIDER_LABELS: Record<string, string> = {
  GOOGLE: "Google",
  AZUREAD: "Microsoft (Azure AD)",
  SAML: "SAML SSO",
  CAL: APP_NAME,
};

export default class ProviderLinkConfirmationEmail extends BaseEmail {
  name = "ProviderLinkConfirmationEmail";

  constructor(
    private readonly opts: {
      to: string;
      confirmUrl: string;
      /** The IdentityProvider string, e.g. "GOOGLE" | "AZUREAD" */
      newProvider: string;
      /** Hours until the link expires — default 24 */
      expiryHours?: number;
    }
  ) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const providerLabel = PROVIDER_LABELS[this.opts.newProvider] ?? this.opts.newProvider;
    return {
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      to: this.opts.to,
      subject: `Confirm linking your ${providerLabel} account to ${APP_NAME}`,
      html: this.buildHtml(providerLabel),
      text: this.buildText(providerLabel),
    };
  }

  private buildHtml(providerLabel: string): string {
    const expiryHours = this.opts.expiryHours ?? 24;
    return `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="font-size:20px;margin-bottom:8px">
          Confirm account provider change
        </h2>
        <p style="color:#555;margin-bottom:16px">
          Someone requested to link your <strong>${APP_NAME}</strong> account
          (<strong>${this.opts.to}</strong>) to <strong>${providerLabel}</strong>.
        </p>
        <p style="color:#555;margin-bottom:24px">
          If this was you, click the button below to confirm. The link expires in
          <strong>${expiryHours} hours</strong>.
        </p>
        <a href="${this.opts.confirmUrl}"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                  font-weight:600;text-decoration:none;border-radius:6px;margin-bottom:24px">
          Confirm account link
        </a>
        <p style="color:#999;font-size:13px;margin-bottom:8px">
          Or copy this link into your browser:
        </p>
        <p style="color:#6366f1;font-size:12px;word-break:break-all;margin-bottom:24px">
          ${this.opts.confirmUrl}
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:16px" />
        <p style="color:#999;font-size:12px">
          <strong>Did not request this?</strong> Ignore this email — your account will not be
          changed. If you are concerned, consider changing your password and enabling two-factor
          authentication.
        </p>
      </div>
    `;
  }

  private buildText(providerLabel: string): string {
    const expiryHours = this.opts.expiryHours ?? 24;
    return (
      `Confirm account provider change\n\n` +
      `Someone requested to link your ${APP_NAME} account (${this.opts.to}) to ${providerLabel}.\n\n` +
      `If this was you, confirm by visiting:\n${this.opts.confirmUrl}\n\n` +
      `This link expires in ${expiryHours} hours.\n\n` +
      `Did not request this? Ignore this email — your account will not be changed.\n` +
      `If you are concerned, consider changing your password and enabling two-factor authentication.`
    );
  }
}
