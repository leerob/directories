"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const toggleJobListingAction = authActionClient
  .metadata({
    actionName: "toggle-job-listing",
  })
  .inputSchema(
    z.object({
      id: z.number(),
      active: z.boolean(),
    }),
  )
  .action(async ({ parsedInput: { id, active }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jobs")
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

    revalidatePath(`/jobs/${data.slug}`);
    revalidatePath("/jobs");
    revalidatePath("/");

    return data;
  });
