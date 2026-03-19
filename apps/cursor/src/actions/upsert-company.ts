"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const upsertCompanyAction = authActionClient
  .metadata({
    actionName: "upsert-company",
  })
  .inputSchema(
    z.object({
      id: z.string().optional(),
      name: z.string(),
      image: z.string().url().nullable(),
      slug: z.string().optional(),
      location: z.string().nullable(),
      bio: z.string().nullable(),
      website: z.string().nullable(),
      social_x_link: z.string().nullable(),
      is_public: z.boolean(),
      redirect: z.boolean().optional(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        id,
        name,
        image,
        slug,
        location,
        bio,
        website,
        social_x_link,
        is_public,
        redirect: shouldRedirect,
      },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      if (id) {
        const { data: existing } = await supabase
          .from("companies")
          .select("id")
          .eq("id", id)
          .eq("owner_id", userId)
          .single();

        if (!existing) {
          throw new Error("You don't have permission to edit this company");
        }
      }

      await supabase.from("companies").upsert(
        {
          id: id ?? undefined,
          name,
          image,
          location,
          slug: slug ?? undefined,
          bio,
          website,
          social_x_link,
          public: is_public,
          owner_id: userId,
        },
        {
          onConflict: "slug",
        },
      );

      const { data, error } = await supabase
        .from("companies")
        .select("id, slug")
        .eq("id", id)
        .eq("owner_id", userId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (shouldRedirect) {
        redirect(`/c/${data?.slug}`);
      }

      return data;
    },
  );
