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
  .schema(z.object({ pluginId: z.string().uuid() }))
  .action(async ({ parsedInput: { pluginId } }) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("plugins")
      .update({ active: true, review_status: "approved" })
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

    if (plugin?.slug) {
      revalidatePath(`/plugins/${plugin.slug}`);
    }

    return { success: true };
  });

export const declinePluginAction = adminActionClient
  .metadata({ actionName: "decline-plugin" })
  .schema(z.object({ pluginId: z.string().uuid() }))
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

export const rerunPluginScanAction = adminActionClient
  .metadata({ actionName: "rerun-plugin-scan" })
  .schema(z.object({ pluginId: z.string().uuid() }))
  .action(async ({ parsedInput: { pluginId } }) => {
    const supabase = await createClient();

    const { error: scanError } = await supabase
      .from("plugin_scans")
      .insert({ plugin_id: pluginId, status: "queued" });

    if (scanError) {
      throw new ActionError(
        `Failed to enqueue scan: ${scanError.message}`,
      );
    }

    revalidatePath("/admin/plugins");

    return { success: true };
  });

export const disablePluginAction = adminActionClient
  .metadata({ actionName: "disable-plugin" })
  .schema(z.object({ pluginId: z.string().uuid() }))
  .action(async ({ parsedInput: { pluginId } }) => {
    const supabase = await createClient();

    const { error } = await supabase
      .from("plugins")
      .update({ active: false, review_status: "flagged" })
      .eq("id", pluginId);

    if (error) {
      throw new ActionError(`Failed to disable plugin: ${error.message}`);
    }

    const { data: plugin } = await supabase
      .from("plugins")
      .select("slug")
      .eq("id", pluginId)
      .single();

    revalidatePath("/admin/plugins");
    revalidatePath("/plugins");
    if (plugin?.slug) revalidatePath(`/plugins/${plugin.slug}`);

    return { success: true };
  });
