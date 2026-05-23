"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Alert } from "@calcom/ui/components/alert";
import { Badge } from "@calcom/ui/components/badge";
import { SettingsToggle } from "@calcom/ui/components/form";
import { SkeletonButton, SkeletonContainer, SkeletonText } from "@calcom/ui/components/skeleton";
import DisableTwoFactorModal from "@components/settings/DisableTwoFactorModal";
import EnableTwoFactorModal from "@components/settings/EnableTwoFactorModal";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import EmailTwoFactorSetupModal from "./EmailTwoFactorSetupModal";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mb-8 mt-6 stack-y-6">
        <div className="flex items-center">
          <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
          <SkeletonText className="h-8 w-full" />
        </div>
      </div>
    </SkeletonContainer>
  );
};

const TwoFactorAuthView = () => {
  const utils = trpc.useUtils();
  const { data: sessionData } = useSession();

  const { t } = useLocale();
  const { data: user, isPending } = trpc.viewer.me.get.useQuery({ includePasswordAdded: true });

  const [enableModalOpen, setEnableModalOpen] = useState<boolean>(false);
  const [disableModalOpen, setDisableModalOpen] = useState<boolean>(false);
  const [emailSetupOpen, setEmailSetupOpen] = useState<boolean>(false);

  if (isPending) return <SkeletonLoader />;

  const isCalProvider = user?.identityProvider === "CAL";
  const canSetupTwoFactor = !isCalProvider && !user?.twoFactorEnabled && !user?.passwordAdded;
  const twoFactorMethod = (user as { twoFactorMethod?: string } | undefined)?.twoFactorMethod ?? "TOTP";

  return (
    <>
      {canSetupTwoFactor && <Alert severity="neutral" message={t("2fa_disabled")} />}
      <SettingsToggle
        toggleSwitchAtTheEnd={true}
        data-testid="two-factor-switch"
        title={t("two_factor_auth")}
        description={t("add_an_extra_layer_of_security")}
        checked={user?.twoFactorEnabled ?? false}
        onCheckedChange={() =>
          user?.twoFactorEnabled ? setDisableModalOpen(true) : setEnableModalOpen(true)
        }
        Badge={
          <Badge className="mx-2 text-xs" variant={user?.twoFactorEnabled ? "success" : "gray"}>
            {user?.twoFactorEnabled ? t("enabled") : t("disabled")}
          </Badge>
        }
        switchContainerClassName="rounded-t-none border-t-0"
      />

      {/* Method selector — visible only when 2FA is enabled */}
      {user?.twoFactorEnabled && (
        <div className="mt-4 rounded-md border border-subtle bg-default p-4">
          <p className="mb-3 text-sm font-medium text-default">Verification method</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <MethodButton
              active={twoFactorMethod === "TOTP"}
              label="Authenticator app"
              description="Use an app like Google Authenticator"
              onClick={() => setEnableModalOpen(true)}
            />
            <MethodButton
              active={twoFactorMethod === "EMAIL"}
              label="Email OTP"
              description="Receive a code at your login email"
              onClick={() => setEmailSetupOpen(true)}
            />
          </div>
        </div>
      )}

      <EnableTwoFactorModal
        open={enableModalOpen}
        onOpenChange={() => setEnableModalOpen(!enableModalOpen)}
        onEnable={() => {
          setEnableModalOpen(false);
          if (sessionData?.user.role === "INACTIVE_ADMIN") {
            signOut({ callbackUrl: "/auth/login" });
          } else {
            utils.viewer.me.invalidate();
          }
        }}
        onCancel={() => {
          setEnableModalOpen(false);
        }}
      />

      <DisableTwoFactorModal
        open={disableModalOpen}
        disablePassword={!isCalProvider}
        onOpenChange={() => setDisableModalOpen(!disableModalOpen)}
        onDisable={() => {
          setDisableModalOpen(false);
          utils.viewer.me.invalidate();
        }}
        onCancel={() => {
          setDisableModalOpen(false)}
        }
      />

      <EmailTwoFactorSetupModal
        open={emailSetupOpen}
        onOpenChange={setEmailSetupOpen}
        onSuccess={() => {
          setEmailSetupOpen(false);
          utils.viewer.me.invalidate();
        }}
      />
    </>
  );
};

interface MethodButtonProps {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}

function MethodButton({ active, label, description, onClick }: MethodButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col rounded-md border p-3 text-left transition-colors ${
        active
          ? "border-brand-default bg-brand-default/5 text-brand-default"
          : "border-subtle text-default hover:border-emphasis"
      }`}>
      <span className="flex items-center gap-2 text-sm font-medium">
        {active && <span className="h-2 w-2 rounded-full bg-brand-default" />}
        {label}
      </span>
      <span className="mt-1 text-xs text-subtle">{description}</span>
    </button>
  );
}

export default TwoFactorAuthView;
