import { z } from "zod";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const officeAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export const getOfficeAppKeys = async () => {
  const appKeys = await getAppKeysFromSlug("office365-calendar");
  if (appKeys.client_id && appKeys.client_secret) {
    return officeAppKeysSchema.parse(appKeys);
  }
  // Fall back to env vars
  if (process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET) {
    return officeAppKeysSchema.parse({
      client_id: process.env.MS_GRAPH_CLIENT_ID,
      client_secret: process.env.MS_GRAPH_CLIENT_SECRET,
    });
  }
  throw new Error("Office 365 credentials not configured. Set MS_GRAPH_CLIENT_ID and MS_GRAPH_CLIENT_SECRET in environment or configure via admin panel.");
};
