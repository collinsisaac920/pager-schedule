"use client";

import { useState } from "react";

import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@calcom/ui/components/dialog";
import { PasswordField } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "phone" | "verify" | "success";

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+55", label: "BR (+55)" },
  { code: "+52", label: "MX (+52)" },
  { code: "+34", label: "ES (+34)" },
];

export default function SmsTwoFactorSetupModal({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [localNumber, setLocalNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const fullPhone = `${countryCode}${localNumber.replace(/\D/g, "")}`;
  const maskedPhone = fullPhone.replace(/(\+\d{1,3})(\d*)(\d{3})$/, (_, cc, mid, last) =>
    `${cc} ${"*".repeat(Math.max(mid.length, 4))} ${last}`
  );

  function reset() {
    setStep("phone");
    setPassword("");
    setLocalNumber("");
    setOtp("");
    setIsLoading(false);
    setCooldown(0);
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function startCooldown() {
    setCooldown(60);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function sendCode() {
    if (!localNumber.replace(/\D/g, "")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/sms/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? "Failed to send SMS code", "error");
        return;
      }
      setStep("verify");
      startCooldown();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/sms/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, phone: fullPhone }),
      });
      if (res.ok) {
        showToast("A new code has been sent", "success");
        startCooldown();
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode() {
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/sms/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(
          data.error === "incorrect-otp-code" ? "Incorrect code. Please try again." : (data.error ?? "Verification failed"),
          "error"
        );
        return;
      }
      setStep("success");
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        {step === "phone" && (
          <>
            <DialogHeader title="Enable SMS verification" />
            <p className="text-sm text-subtle">
              {"We'll send a 6-digit code to your phone number each time you sign in."}
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); sendCode(); }}
              className="mt-4 space-y-4">
              <PasswordField
                label="Current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-emphasis">Phone number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-md border border-default bg-default px-2 py-2 text-sm text-emphasis focus:border-brand-default focus:outline-none">
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={localNumber}
                    onChange={(e) => setLocalNumber(e.target.value)}
                    className="flex-1 rounded-md border border-default bg-default px-3 py-2 text-sm text-emphasis placeholder:text-muted focus:border-brand-default focus:outline-none"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" color="minimal" onClick={handleClose}>Cancel</Button>
                <Button type="submit" loading={isLoading} disabled={!password || !localNumber.replace(/\D/g, "")}>
                  Send code
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader title="Enter verification code" />
            <p className="text-sm text-subtle">
              {"Enter the 6-digit code we sent to "}
              <strong>{maskedPhone}</strong>.
            </p>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-md border border-default bg-default px-3 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-brand-default"
                autoComplete="one-time-code"
                autoFocus
              />
              <button
                type="button"
                onClick={resendCode}
                disabled={cooldown > 0}
                className="text-sm text-subtle hover:text-emphasis disabled:cursor-not-allowed disabled:opacity-50">
                {cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
              </button>
              <DialogFooter>
                <Button type="button" color="minimal" onClick={() => setStep("phone")}>Back</Button>
                <Button
                  type="button"
                  loading={isLoading}
                  disabled={otp.length !== 6 || isLoading}
                  onClick={verifyCode}>
                  Verify
                </Button>
              </DialogFooter>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader title="SMS verification enabled" />
            <div className="mt-2 flex flex-col items-center gap-3 py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center text-sm text-subtle">
                {"Your account is now protected. We'll text you a code each time you sign in."}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => { handleClose(); onSuccess(); }}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
