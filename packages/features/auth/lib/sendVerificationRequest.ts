import type { SendVerificationRequestParams } from "next-auth/providers/email";

import { APP_NAME, WEBAPP_URL } from "@calcom/lib/constants";

const sendVerificationRequest = async ({
  identifier,
  url,
}: Pick<SendVerificationRequestParams, "identifier" | "url">) => {
  const originalUrl = new URL(url);
  const webappUrl = new URL(process.env.NEXTAUTH_URL || WEBAPP_URL);
  if (originalUrl.origin !== webappUrl.origin) {
    url = url.replace(originalUrl.origin, webappUrl.origin);
  }

  const apiKey = process.env.EMAIL_SERVER_PASSWORD || process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing Resend API key (EMAIL_SERVER_PASSWORD or RESEND_API_KEY)");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${APP_NAME} <${process.env.EMAIL_FROM || "noreply@apppager.com"}>`,
      to: [identifier],
      subject: `Sign in to ${APP_NAME}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #E4E8F2">
          <div style="text-align:center;margin-bottom:28px">
            <img src="https://pagerschedule.com/logo.svg" alt="${APP_NAME}" width="130" height="40" />
          </div>
          <h2 style="color:#0F172A;font-size:20px;font-weight:800;text-align:center;margin:0 0 8px">
            Sign in to ${APP_NAME}
          </h2>
          <p style="color:#64748B;font-size:14px;text-align:center;margin:0 0 24px">
            Click below to sign in. Link expires in 10 hours.
          </p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${url}" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 28px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">
              Sign in →
            </a>
          </div>
          <p style="color:#94A3B8;font-size:11px;text-align:center;font-family:monospace;margin:0">
            ◎ Zero tracking pixels in this email · pagerschedule.com
          </p>
        </div>
      `,
      text: `Sign in to ${APP_NAME}\n\n${url}\n\nExpires in 10 hours.\n\n◎ Zero tracking · pagerschedule.com`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${body}`);
  }
};

export default sendVerificationRequest;
