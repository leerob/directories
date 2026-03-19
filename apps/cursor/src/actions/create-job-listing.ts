"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const createJobListingAction = authActionClient
  .metadata({
    actionName: "create-job-listing",
  })
  .inputSchema(
    z.object({
      title: z.string(),
      company_id: z.string(),
      location: z.string().nullable(),
      description: z.string(),
      link: z.string().url(),
      workplace: z.enum(["On site", "Remote", "Hybrid"]),
      experience: z.string().nullable(),
    }),
  )
  .action(
    async ({
      parsedInput: {
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

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("id", company_id)
        .eq("owner_id", userId)
        .single();

      if (!company) {
        throw new Error("You don't have permission to create a job for this company");
      }

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title,
          company_id,
          location,
          description,
          link,
          workplace,
          experience,
          owner_id: userId,
          plan: "standard",
          active: true,
          order: 0,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/");
      revalidatePath("/jobs");
      redirect("/jobs");
    },
  );
