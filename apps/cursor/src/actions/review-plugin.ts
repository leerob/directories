"use server";

import PluginApprovedEmail from "@/emails/templates/plugin-approved";
import { resend } from "@/lib/resend";
import { createClient } from "@/utils/supabase/admin-client";
import { waitUntil } from "@vercel/functions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, adminActionClient } from "./safe-action";

export const approvePluginAction = adminActionClient
  .metadata({ actionName: "approve-plugin" })
  .inputSchema(z.object({ pluginId: z.string().uuid() }))
  .action(async ({ parsedInput: { pluginId } }) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("plugins")
      .update({ active: true })
      .eq("id", pluginId);

    if (error) {
      throw new ActionError(`Failed to approve plugin: ${error.message}`);
    }

    const { data: plugin } = await supabase
      .from("plugins")
      .select("name, slug, owner_id")
      .eq("id", pluginId)
      .single();

    if (plugin?.owner_id) {
      const { data: owner } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", plugin.owner_id)
        .single();

      if (owner?.email) {
        waitUntil(
          resend.emails.send({
            from: "Cursor Directory <hello@transactional.cursor.directory>",
            to: owner.email,
            subject: `Your plugin "${plugin.name}" is now live on Cursor Directory`,
            react: PluginApprovedEmail({
              name: owner.name ?? "there",
              pluginName: plugin.name,
              pluginSlug: plugin.slug,
            }),
          }),
        );
      }
    }

    revalidatePath("/admin/plugins");
    revalidatePath("/plugins");

    return { success: true };
  });

export const declinePluginAction = adminActionClient
  .metadata({ actionName: "decline-plugin" })
  .inputSchema(z.object({ pluginId: z.string().uuid() }))
  .action(async ({ parsedInput: { pluginId } }) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("plugins")
      .delete()
      .eq("id", pluginId);

    if (error) {
      throw new ActionError(`Failed to decline plugin: ${error.message}`);
    }

    revalidatePath("/admin/plugins");
    revalidatePath("/plugins");

    return { success: true };
  });
