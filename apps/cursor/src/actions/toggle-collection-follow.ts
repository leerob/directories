"use server";

import { getCollectionUrl } from "@/lib/collections";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, authActionClient } from "./safe-action";

export const toggleCollectionFollowAction = authActionClient
  .metadata({
    actionName: "toggle-collection-follow",
  })
  .schema(
    z.object({
      action: z.enum(["follow", "unfollow"]),
      collectionId: z.string().uuid(),
      ownerSlug: z.string(),
      collectionSlug: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { action, collectionId, ownerSlug, collectionSlug },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      if (action === "follow") {
        const { error } = await supabase.from("collection_follows").insert({
          collection_id: collectionId,
          user_id: userId,
        });

        if (error && !error.message.includes("duplicate")) {
          throw new ActionError(error.message);
        }
      } else {
        const { error } = await supabase
          .from("collection_follows")
          .delete()
          .eq("collection_id", collectionId)
          .eq("user_id", userId);

        if (error) {
          throw new ActionError(error.message);
        }
      }

      const path = getCollectionUrl(ownerSlug, collectionSlug);
      revalidatePath("/collections");
      revalidatePath(path);
    },
  );
