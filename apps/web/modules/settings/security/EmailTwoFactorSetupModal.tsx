"use client";

import { useState } from "react";

import { Button } from "@calcom/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@calcom/ui/components/dialog";
import { Form, PasswordField } from "@calcom/ui/components/form";
import { showToast } from "@calcom/ui/components/toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EmailTwoFactorSetupModal({ open, onOpenChange, onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/two-factor/email/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error ?? "Failed to enable email 2FA", "error");
        return;
      }

      showToast("Email verification enabled. A code will be sent to your email each time you sign in.", "success");
      onSuccess();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader title="Enable email verification" />
        <p className="text-sm text-subtle">
          Each time you sign in, we will email a 6-digit code to{" "}
          <strong>your account email address</strong>. Confirm your password to switch.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <PasswordField
            label="Current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <DialogFooter>
            <Button type="button" color="minimal" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={!password}>
              Enable email 2FA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
