import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const deletePostAction = authActionClient
  .metadata({
    actionName: "delete-post",
  })
  .inputSchema(
    z.object({
      postId: z.number(),
    }),
  )
  .action(async ({ parsedInput: { postId }, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/board");

    return data;
  });
