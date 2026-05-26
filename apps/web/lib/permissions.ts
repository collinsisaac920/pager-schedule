import type { MembershipRole } from "@calcom/prisma/enums";

export const PERMISSIONS = {
  MANAGE_TEAM: ["OWNER", "ADMIN"],
  MANAGE_MEMBERS: ["OWNER", "ADMIN"],
  CREATE_EVENTS: ["OWNER", "ADMIN", "MEMBER"],
  VIEW_ALL_BOOKINGS: ["OWNER", "ADMIN"],
  VIEW_OWN_BOOKINGS: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
  EDIT_SETTINGS: ["OWNER", "ADMIN"],
  EXPORT_DATA: ["OWNER", "ADMIN"],
  MANAGE_BILLING: ["OWNER"],
  DELETE_TEAM: ["OWNER"],
} as const satisfies Record<string, ReadonlyArray<string>>;

export function hasPermission(
  userRole: MembershipRole | string,
  permission: keyof typeof PERMISSIONS
): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(userRole);
}
