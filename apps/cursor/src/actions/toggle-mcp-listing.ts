"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const toggleMCPListingAction = authActionClient
  .metadata({
    actionName: "toggle-mcp-listing",
  })
  .inputSchema(
    z.object({
      id: z.string(),
      active: z.boolean(),
    }),
  )
  .action(async ({ parsedInput: { id, active }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mcps")
      .update({
        active,
      })
      .eq("id", id)
      .eq("owner_id", userId)
      .select("slug")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/mcp/${data.slug}`);
    revalidatePath("/mcp");
    revalidatePath("/");

    return data;
  });
