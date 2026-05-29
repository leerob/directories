"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { ActionError, authActionClient } from "./safe-action";

export const deletePluginAction = authActionClient
  .metadata({
    actionName: "delete-plugin",
  })
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("plugins")
      .select("id, owner_id, slug, active")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new ActionError("Plugin not found.");
    }

    if (existing.owner_id !== userId) {
      throw new ActionError("You do not have permission to delete this plugin.");
    }

    const { error } = await supabase
      .from("plugins")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      throw new ActionError(`Failed to delete plugin: ${error.message}`);
    }

    revalidatePath("/");
    revalidatePath("/admin/plugins");

    return { slug: existing.slug };
  });
