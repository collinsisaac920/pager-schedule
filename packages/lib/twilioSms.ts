export async function sendSmsOtp(to: string, otp: string): Promise<void> {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER ?? process.env.TWILIO_WHATSAPP_NUMBER;
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "PagerSchedule";

  if (!accountSid || !authToken || !from) {
    throw new Error("Twilio credentials (TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE_NUMBER) are not configured");
  }

  const body = `Your ${appName} verification code is ${otp}. It expires in 10 minutes.`;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio SMS failed: ${res.status} ${text}`);
  }
}

export function isTwilioConfigured(): boolean {
  return !!(process.env.TWILIO_SID && process.env.TWILIO_TOKEN &&
    (process.env.TWILIO_PHONE_NUMBER ?? process.env.TWILIO_WHATSAPP_NUMBER));
}
