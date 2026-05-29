"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { ActionError, authActionClient } from "./safe-action";

export const togglePluginListingAction = authActionClient
  .metadata({
    actionName: "toggle-plugin-listing",
  })
  .schema(
    z.object({
      id: z.string().uuid(),
      active: z.boolean(),
    }),
  )
  .action(async ({ parsedInput: { id, active }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: existing, error: fetchError } = await supabase
      .from("plugins")
      .select("id, owner_id, slug, permanently_blocked")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new ActionError("Plugin not found.");
    }

    if (existing.owner_id !== userId) {
      throw new ActionError("You do not have permission to update this plugin.");
    }

    if (active && existing.permanently_blocked) {
      throw new ActionError(
        "This plugin cannot be published. Contact support if you believe this is a mistake.",
      );
    }

    const { data, error } = await supabase
      .from("plugins")
      .update({ active })
      .eq("id", id)
      .eq("owner_id", userId)
      .select("slug")
      .single();

    if (error) {
      throw new ActionError(error.message);
    }

    revalidatePath("/");
    revalidatePath(`/plugins/${data.slug}`);

    return data;
  });
