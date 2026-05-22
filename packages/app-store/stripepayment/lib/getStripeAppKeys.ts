import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { appKeysSchema } from "../zod";

export const getStripeAppKeys = async () => {
  const dbKeys = await getAppKeysFromSlug("stripe");
  if (dbKeys.client_id && dbKeys.client_secret) {
    return appKeysSchema.parse(dbKeys);
  }
  // Fall back to env vars
  if (
    process.env.STRIPE_CLIENT_ID &&
    process.env.STRIPE_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  ) {
    return appKeysSchema.parse({
      client_id: process.env.STRIPE_CLIENT_ID,
      client_secret: process.env.STRIPE_PRIVATE_KEY,
      public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }
  throw new Error("Stripe credentials not configured. Set STRIPE_CLIENT_ID, STRIPE_PRIVATE_KEY, NEXT_PUBLIC_STRIPE_PUBLIC_KEY, and STRIPE_WEBHOOK_SECRET in environment.");
};
