import { APP_NAME, EMAIL_FROM_NAME } from "@calcom/lib/constants";

import BaseEmail from "./_base-email";

interface TwoFactorOtpEmailOpts {
  to: string;
  otp: string;
  expiryMinutes?: number;
}

export default class TwoFactorOtpEmail extends BaseEmail {
  private opts: TwoFactorOtpEmailOpts;

  constructor(opts: TwoFactorOtpEmailOpts) {
    super();
    this.name = "SEND_TWO_FACTOR_OTP_EMAIL";
    this.opts = opts;
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    const expiry = this.opts.expiryMinutes ?? 10;
    return {
      to: this.opts.to,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      subject: `Your ${APP_NAME} login code`,
      html: this.getHtmlBody(expiry),
      text: this.getTextBody(expiry),
    };
  }

  private getHtmlBody(expiryMinutes: number): string {
    const { otp } = this.opts;
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;background:#f4f4f5;margin:0;padding:32px 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;padding:40px;">
        <tr><td>
          <h2 style="margin:0 0 8px;font-size:20px;color:#111;">${APP_NAME} login verification</h2>
          <p style="margin:0 0 24px;color:#555;font-size:14px;">
            Use the code below to complete your sign-in. It expires in ${expiryMinutes} minutes.
          </p>
          <div style="text-align:center;letter-spacing:12px;font-size:36px;font-weight:700;
                      color:#111;background:#f4f4f5;border-radius:8px;padding:20px 0;
                      margin:0 0 24px;">${otp}</div>
          <p style="margin:0;color:#888;font-size:12px;">
            If you didn't try to sign in, you can ignore this email safely.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private getTextBody(expiryMinutes: number): string {
    return `Your ${APP_NAME} login code: ${this.opts.otp}\n\nThis code expires in ${expiryMinutes} minutes.\n\nIf you didn't try to sign in, ignore this email.`;
  }
}
