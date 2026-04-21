"use server";

import {
  addAmbassadorByEmail,
  emailSchema,
  removeAmbassadorByUserId,
  removePendingAmbassadorEmail,
  userIdSchema,
} from "@/data/ambassadors";
import { createClient } from "@/utils/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, adminActionClient } from "./safe-action";

function revalidateAmbassadorPaths() {
  revalidatePath("/admin/ambassadors");
  revalidatePath("/members");
}

export const addAmbassadorAction = adminActionClient
  .metadata({ actionName: "add-ambassador" })
  .schema(z.object({ email: emailSchema }))
  .action(async ({ parsedInput: { email }, ctx }) => {
    const supabase = await createClient();

    try {
      const result = await addAmbassadorByEmail(supabase, email, ctx.userId);
      revalidateAmbassadorPaths();
      return result;
    } catch (err) {
      throw new ActionError(
        err instanceof Error ? err.message : "Failed to add ambassador",
      );
    }
  });

export const removeAmbassadorAction = adminActionClient
  .metadata({ actionName: "remove-ambassador" })
  .schema(z.object({ userId: userIdSchema }))
  .action(async ({ parsedInput: { userId } }) => {
    const supabase = await createClient();

    try {
      const result = await removeAmbassadorByUserId(supabase, userId);
      revalidateAmbassadorPaths();
      return result;
    } catch (err) {
      throw new ActionError(
        err instanceof Error ? err.message : "Failed to remove ambassador",
      );
    }
  });

export const removePendingAmbassadorAction = adminActionClient
  .metadata({ actionName: "remove-pending-ambassador" })
  .schema(z.object({ email: emailSchema }))
  .action(async ({ parsedInput: { email } }) => {
    const supabase = await createClient();

    try {
      const result = await removePendingAmbassadorEmail(supabase, email);
      revalidateAmbassadorPaths();
      return result;
    } catch (err) {
      throw new ActionError(
        err instanceof Error ? err.message : "Failed to remove pending email",
      );
    }
  });
