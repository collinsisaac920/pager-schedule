"use client";

import { useState } from "react";

import { trpc } from "@calcom/trpc/react";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { SkeletonButton, SkeletonContainer, SkeletonText } from "@calcom/ui/components/skeleton";
import DisableTwoFactorModal from "@components/settings/DisableTwoFactorModal";
import { signOut, useSession } from "next-auth/react";

import EmailTwoFactorSetupModal from "./EmailTwoFactorSetupModal";
import SmsTwoFactorSetupModal from "./SmsTwoFactorSetupModal";

const isSmsEnabled = process.env.NEXT_PUBLIC_SMS_2FA_ENABLED === "true";

const SkeletonLoader = () => (
  <SkeletonContainer>
    <div className="mb-8 mt-6 space-y-6">
      <div className="flex items-center">
        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
        <SkeletonText className="h-8 w-full" />
      </div>
    </div>
  </SkeletonContainer>
);

const TwoFactorAuthView = () => {
  const utils = trpc.useUtils();
  const { data: sessionData } = useSession();
  const { data: user, isPending } = trpc.viewer.me.get.useQuery({ includePasswordAdded: true });

  const [emailSetupOpen, setEmailSetupOpen] = useState(false);
  const [smsSetupOpen, setSmsSetupOpen] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  if (isPending) return <SkeletonLoader />;

  const twoFactorEnabled = user?.twoFactorEnabled ?? false;
  const twoFactorMethod = (user as { twoFactorMethod?: string } | undefined)?.twoFactorMethod ?? "EMAIL";
  const userEmail = user?.email ?? "";

  const handleSetupSuccess = () => {
    if (sessionData?.user.role === "INACTIVE_ADMIN") {
      signOut({ callbackUrl: "/auth/login" });
    } else {
      utils.viewer.me.invalidate();
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-base font-semibold text-emphasis">Two-factor authentication</h2>
        <p className="text-sm text-subtle">Add an extra layer of security to your account.</p>
      </div>

      {twoFactorEnabled ? (
        <div className="rounded-md border border-subtle bg-default p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-emphasis">
                  {twoFactorMethod === "SMS" ? "SMS verification" : "Email verification"}
                  <Badge variant="success" className="text-xs">Enabled</Badge>
                </div>
                <p className="text-xs text-subtle">
                  {twoFactorMethod === "SMS"
                    ? "You receive a verification code via SMS when signing in."
                    : "You receive a verification code by email when signing in."}
                </p>
              </div>
            </div>
            <Button color="destructive" size="sm" onClick={() => setDisableModalOpen(true)}>
              Disable
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between rounded-md border border-subtle bg-default p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-default/10 text-brand-default">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-emphasis">Email verification</p>
                <p className="text-xs text-subtle">Receive a code by email each time you sign in.</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setEmailSetupOpen(true)}>Enable</Button>
          </div>

          {isSmsEnabled && (
            <div className="flex items-start justify-between rounded-md border border-subtle bg-default p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-brand-default/10 text-brand-default">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-emphasis">SMS verification</p>
                  <p className="text-xs text-subtle">Receive a code by text message each time you sign in.</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setSmsSetupOpen(true)}>Enable</Button>
            </div>
          )}
        </div>
      )}

      <EmailTwoFactorSetupModal
        open={emailSetupOpen}
        userEmail={userEmail}
        onOpenChange={setEmailSetupOpen}
        onSuccess={() => {
          setEmailSetupOpen(false);
          handleSetupSuccess();
        }}
      />

      {isSmsEnabled && (
        <SmsTwoFactorSetupModal
          open={smsSetupOpen}
          onOpenChange={setSmsSetupOpen}
          onSuccess={() => {
            setSmsSetupOpen(false);
            handleSetupSuccess();
          }}
        />
      )}

      <DisableTwoFactorModal
        open={disableModalOpen}
        disablePassword={!(user?.identityProvider === "CAL")}
        onOpenChange={() => setDisableModalOpen(!disableModalOpen)}
        onDisable={() => {
          setDisableModalOpen(false);
          utils.viewer.me.invalidate();
        }}
        onCancel={() => setDisableModalOpen(false)}
      />
    </>
  );
};

export default TwoFactorAuthView;
