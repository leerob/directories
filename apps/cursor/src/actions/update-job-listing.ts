"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const updateJobListingAction = authActionClient
  .metadata({
    actionName: "update-job-listing",
  })
  .inputSchema(
    z.object({
      id: z.number(),
      title: z.string(),
      company_id: z.string(),
      location: z.string().nullable(),
      description: z.string(),
      link: z.url(),
      workplace: z.enum(["On site", "Remote", "Hybrid"]),
      experience: z.string().nullable(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        id,
        title,
        company_id,
        location,
        description,
        link,
        workplace,
        experience,
      },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("jobs")
        .update({
          title,
          company_id,
          location,
          description,
          link,
          workplace,
          experience,
        })
        .eq("id", id)
        .eq("owner_id", userId)
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/jobs");
      revalidatePath("/");

      return data;
    },
  );
