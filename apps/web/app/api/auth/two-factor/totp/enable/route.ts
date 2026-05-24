import { NextResponse } from "next/server";

// TOTP (Google Authenticator) removed. Use /api/auth/two-factor/email or /sms instead.
export function POST() {
  return NextResponse.json(
    { error: "TOTP authentication is no longer supported. Use email or SMS verification." },
    { status: 410 }
  );
}
