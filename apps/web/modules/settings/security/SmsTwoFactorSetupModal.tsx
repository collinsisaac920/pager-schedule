"use client";

import { useState } from "react";

import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@calcom/ui/components/dialog";
import { PasswordField, TextField } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = "phone" | "code";

export default function SmsTwoFactorSetupModal({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleClose() {
    setStep("phone");
    setPhoneNumber("");
    setCode("");
    setPassword("");
    onOpenChange(false);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? "Failed to send verification code", "error");
        return;
      }

      showToast("Verification code sent to your phone", "success");
      setStep("code");
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? "Verification failed", "error");
        return;
      }

      showToast("SMS two-factor authentication enabled!", "success");
      onSuccess();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader title="Enable SMS verification" />

        {step === "phone" && (
          <form onSubmit={handleSendCode} className="mt-4 space-y-4">
            <p className="text-sm text-subtle">
              Enter your phone number in international format (e.g.{" "}
              <span className="font-mono">+14155552671</span>). We will send a 6-digit code to confirm
              ownership.
            </p>
            <TextField
              label="Phone number"
              type="tel"
              placeholder="+14155552671"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <DialogFooter>
              <Button type="button" color="minimal" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading} disabled={!phoneNumber}>
                Send code
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="mt-4 space-y-4">
            <p className="text-sm text-subtle">
              Enter the 6-digit code sent to <strong>{phoneNumber}</strong> and confirm your password to
              enable SMS 2FA.
            </p>
            <TextField
              label="Verification code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
            <PasswordField
              label="Current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <DialogFooter>
              <Button type="button" color="minimal" onClick={() => setStep("phone")}>
                Back
              </Button>
              <Button type="submit" loading={isLoading} disabled={code.length !== 6 || !password}>
                Enable SMS 2FA
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
