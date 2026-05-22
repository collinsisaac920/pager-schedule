import { z } from "zod";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const googleAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.array(z.string()),
});

export const getGoogleAppKeys = async () => {
  const dbKeys = await getAppKeysFromSlug("google-calendar");
  if (dbKeys.client_id) {
    return googleAppKeysSchema.parse(dbKeys);
  }
  // Fall back to GOOGLE_API_CREDENTIALS env var (format: {"web":{"client_id":"...","client_secret":"...","redirect_uris":[...]}})
  const envCreds = process.env.GOOGLE_API_CREDENTIALS;
  if (envCreds) {
    const parsed = JSON.parse(envCreds);
    const creds = parsed.web || parsed.installed || parsed;
    return googleAppKeysSchema.parse({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      redirect_uris: creds.redirect_uris || [],
    });
  }
  throw new Error("Google API credentials not configured. Set GOOGLE_API_CREDENTIALS in environment or configure via admin panel.");
};
