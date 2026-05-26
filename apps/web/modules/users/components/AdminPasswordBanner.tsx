import type { SessionContextValue } from "next-auth/react";

export type AdminPasswordBannerProps = { data: SessionContextValue["data"] };

function AdminPasswordBanner({ data: _data }: AdminPasswordBannerProps) {
  // Pager Schedule does not surface admin 2FA/password banners
  return null;
}

export default AdminPasswordBanner;
