/**
 * Thin wrapper around the Twilio Verify v2 REST API.
 * No SDK required — uses native fetch.
 *
 * Preferred auth (scoped, rotatable):
 *   TWILIO_API_KEY_SID     – Twilio API Key SID (starts with "SK")
 *   TWILIO_API_KEY_SECRET  – Twilio API Key Secret
 *   TWILIO_ACCOUNT_SID     – your Twilio Account SID (still required for URL construction)
 *
 * Fallback auth (high-privilege, use only if API keys are not configured):
 *   TWILIO_AUTH_TOKEN      – your Twilio Auth Token
 *
 * Also required:
 *   TWILIO_VERIFY_SID      – your Verify Service SID (starts with "VA")
 */

import process from "node:process";

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const verifySid = process.env.TWILIO_VERIFY_SID;

  if (!accountSid || !verifySid) {
    throw new Error("SMS 2FA is not configured. Set TWILIO_ACCOUNT_SID and TWILIO_VERIFY_SID.");
  }

  const apiKeySid = process.env.TWILIO_API_KEY_SID;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Prefer scoped API Keys over the high-privilege Account Auth Token.
  if (apiKeySid && apiKeySecret) {
    return { accountSid, credential: { user: apiKeySid, pass: apiKeySecret }, verifySid };
  }

  if (authToken) {
    return { accountSid, credential: { user: accountSid, pass: authToken }, verifySid };
  }

  throw new Error(
    "SMS 2FA is not configured. Set TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET (recommended) or TWILIO_AUTH_TOKEN."
  );
}

function twilioFetch(url: string, body: URLSearchParams, credential: { user: string; pass: string }) {
  const encoded = Buffer.from(`${credential.user}:${credential.pass}`).toString("base64");
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
}

/**
 * Sends an SMS OTP to the given E.164 phone number via Twilio Verify.
 * Throws if the API call fails.
 */
export async function sendSmsOTP(phoneNumber: string): Promise<void> {
  const { accountSid, credential, verifySid } = getConfig();
  const url = `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`;

  const res = await twilioFetch(url, new URLSearchParams({ To: phoneNumber, Channel: "sms" }), credential);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Twilio Verify send failed (${res.status}): ${body}`);
  }
}

/**
 * Verifies the OTP code the user entered against Twilio Verify.
 * Returns true if approved, false if the code is wrong or expired.
 * Throws on unexpected API errors.
 */
export async function verifySmsOTP(phoneNumber: string, code: string): Promise<boolean> {
  const { accountSid, credential, verifySid } = getConfig();
  const url = `https://verify.twilio.com/v2/Services/${verifySid}/VerificationChecks`;

  const res = await twilioFetch(url, new URLSearchParams({ To: phoneNumber, Code: code.trim() }), credential);

  if (res.status === 404) {
    // Twilio returns 404 when the code is already expired or used.
    return false;
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Twilio Verify check failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { status: string };
  return data.status === "approved";
}
