import { APP_NAME } from "@calcom/lib/constants";

import BaseEmail from "./_base-email";

export default class TwoFactorOtpEmail extends BaseEmail {
  name = "TwoFactorOtpEmail";

  constructor(
    private readonly opts: {
      to: string;
      otp: string;
      expiryMinutes: number;
    }
  ) {
    super();
  }

  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      from: `${APP_NAME} <${this.getMailerOptions().from}>`,
      to: this.opts.to,
      subject: `Your ${APP_NAME} verification code: ${this.opts.otp}`,
      html: this.buildHtml(),
      text: this.buildText(),
    };
  }

  private buildHtml(): string {
    return `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="font-size:20px;margin-bottom:8px">Your login verification code</h2>
        <p style="color:#555;margin-bottom:24px">
          Enter this code to complete signing in to ${APP_NAME}.
          It expires in ${this.opts.expiryMinutes} minutes.
        </p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;text-align:center;
                    padding:16px;background:#f4f4f5;border-radius:8px;margin-bottom:24px">
          ${this.opts.otp}
        </div>
        <p style="color:#999;font-size:13px">
          If you didn't request this code, you can safely ignore this email.
          Never share this code with anyone.
        </p>
      </div>
    `;
  }

  private buildText(): string {
    return (
      `Your ${APP_NAME} verification code is: ${this.opts.otp}\n\n` +
      `This code expires in ${this.opts.expiryMinutes} minutes.\n\n` +
      `If you did not request this, ignore this email and do not share the code.`
    );
  }
}
