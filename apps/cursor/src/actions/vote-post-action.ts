"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const votePostAction = authActionClient
  .metadata({
    actionName: "vote-post",
  })
  .inputSchema(
    z.object({
      postId: z.number(),
      action: z.enum(["upvote", "downvote"]),
    }),
  )
  .action(async ({ parsedInput: { postId, action }, ctx: { userId } }) => {
    const supabase = await createClient();

    if (action === "upvote") {
      const { error } = await supabase
        .from("votes")
        .insert({ post_id: postId, user_id: userId });

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/board");

      return;
    }

    const { error } = await supabase
      .from("votes")
      .delete()

      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/board");

    return;
  });
