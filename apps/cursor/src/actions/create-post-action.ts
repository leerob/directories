"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const createPostAction = authActionClient
  .metadata({
    actionName: "create-post",
  })
  .inputSchema(
    z.object({
      title: z.string(),
      content: z.string().optional().nullable(),
      url: z.string().url().nullable(),
    }),
  )
  .action(async ({ parsedInput: { title, content, url }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: post } = await supabase
      .from("posts")
      .select()
      .eq("url", url)
      .limit(1);

    if (post && post.length > 0) {
      throw new Error("This URL has already been submitted.");
    }

    const { data, error } = await supabase.from("posts").insert({
      title,
      content,
      url,
      user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/board");

    return data;
  });
