"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { installGlobalLimit, installPerPluginLimit } from "@/lib/rate-limit";
import { createClient as createAdminClient } from "@/utils/supabase/admin-client";
import { actionClient } from "./safe-action";

export type TrackInstallResult =
  | { tracked: true }
  | { tracked: false; rateLimited: true };

export const trackInstallAction = actionClient
  .metadata({
    actionName: "track-install",
  })
  .schema(
    z.object({
      pluginId: z.string().uuid(),
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput: { pluginId, slug } }) => {
    const [global, perPlugin] = await Promise.all([
      installGlobalLimit(),
      installPerPluginLimit(pluginId),
    ]);

    if (!global.success || !perPlugin.success) {
      return { tracked: false, rateLimited: true } satisfies TrackInstallResult;
    }

    const admin = await createAdminClient();

    await admin.rpc("increment_install_count", {
      plugin_id_input: pluginId,
    });

    revalidatePath("/");
    revalidatePath(`/plugins/${slug}`);

    return { tracked: true } satisfies TrackInstallResult;
  });
