import { z } from "zod";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const zoomAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
});

export const getZoomAppKeys = async () => {
  const appKeys = await getAppKeysFromSlug("zoom");
  if (appKeys.client_id && appKeys.client_secret) {
    return zoomAppKeysSchema.parse(appKeys);
  }
  // Fall back to env vars
  if (process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET) {
    return zoomAppKeysSchema.parse({
      client_id: process.env.ZOOM_CLIENT_ID,
      client_secret: process.env.ZOOM_CLIENT_SECRET,
    });
  }
  throw new Error("Zoom credentials not configured. Set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in environment or configure via admin panel.");
};
