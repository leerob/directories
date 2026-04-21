"use server";

import { createClient as createAdminClient } from "@/utils/supabase/admin-client";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const starPluginAction = authActionClient
  .metadata({
    actionName: "star-plugin",
  })
  .inputSchema(
    z.object({
      pluginId: z.uuid(),
      slug: z.string(),
    }),
  )
  .action(async ({ parsedInput: { pluginId, slug }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("plugin_stars")
      .select("plugin_id")
      .eq("plugin_id", pluginId)
      .eq("user_id", userId)
      .maybeSingle();

    const admin = await createAdminClient();

    if (existing) {
      await supabase
        .from("plugin_stars")
        .delete()
        .eq("plugin_id", pluginId)
        .eq("user_id", userId);

      await admin.rpc("decrement_star_count", { plugin_id_input: pluginId });
    } else {
      await supabase
        .from("plugin_stars")
        .insert({ plugin_id: pluginId, user_id: userId });

      await admin.rpc("increment_star_count", { plugin_id_input: pluginId });
    }

    revalidatePath("/plugins");
    revalidatePath(`/plugins/${slug}`);
  });
