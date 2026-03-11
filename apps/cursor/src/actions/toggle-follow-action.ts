"use server";

import FollowerEmail from "@/emails/templates/follower";
import { getResend } from "@/lib/resend";
import { createClient as createAdminClient } from "@/utils/supabase/admin-client";
import { createClient } from "@/utils/supabase/server";
import { waitUntil } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "./safe-action";

export const toggleFollowAction = authActionClient
  .metadata({
    actionName: "toggle-follow",
  })
  .schema(
    z.object({
      action: z.enum(["follow", "unfollow"]),
      userId: z.string().uuid(),
      slug: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: { userId, action, slug },
      ctx: { userId: currentUserId },
    }) => {
      const supabase = await createClient();
      const adminClient = await createAdminClient();

      if (action === "follow") {
        const { data, error } = await supabase
          .from("followers")
          .insert({ follower_id: currentUserId, following_id: userId })
          .select("follower:follower_id(name, slug, email)")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        revalidatePath(`/u/${slug}`);

        if (data.follower) {
          const { data: userData } = await adminClient
            .from("users")
            .select("email, name, follow_email")
            .eq("id", userId)
            .single();

          if (!userData) {
            throw new Error("User not found");
          }

          if (userData.follow_email) {
            const resend = getResend();
            if (resend) {
              waitUntil(
                resend.emails.send({
                  from: "Cursor Directory <hello@transactional.cursor.directory>",
                  to: userData.email!,
                  //   @ts-ignore
                  subject: `${data.follower.name} is now following you on Cursor Directory`,
                  react: FollowerEmail({
                    name: userData.name!,
                    // @ts-ignore
                    followerName: data.follower.name!,
                    // @ts-ignore
                    followerSlug: data.follower.slug!,
                    followingSlug: slug,
                  }),
                }),
              );
            }
          }
        }

        return;
      }

      if (action === "unfollow") {
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
      }

      revalidatePath(`/u/${slug}`);

      return;
    },
  );
