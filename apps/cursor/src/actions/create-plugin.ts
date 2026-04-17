"use server";

import { createClient } from "@/utils/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError } from "./safe-action";
import { authActionClient } from "./safe-action";

const componentSchema = z.object({
  type: z.enum([
    "rule",
    "mcp_server",
    "skill",
    "agent",
    "hook",
    "lsp_server",
    "command",
  ]),
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const createPluginAction = authActionClient
  .metadata({
    actionName: "create-plugin",
  })
  .schema(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      description: z.string().min(10, "Description must be at least 10 characters"),
      logo: z.string().nullable().optional(),
      repository: z.string().url().nullable().optional(),
      homepage: z.string().url().nullable().optional(),
      keywords: z.array(z.string()).optional(),
      components: z.array(componentSchema).min(1, "At least one component is required"),
    }),
  )
  .action(
    async ({
      parsedInput: { name, description, logo, repository, homepage, keywords, components },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      const { data: plugin, error: pluginError } = await supabase
        .from("plugins")
        .insert({
          name,
          description,
          logo: logo || null,
          repository: repository || null,
          homepage: homepage || null,
          keywords: keywords || [],
          owner_id: userId,
          active: false,
          plan: "standard",
          review_status: "pending",
        })
        .select("id, slug")
        .single();

      if (pluginError) {
        if (pluginError.code === "23505") {
          throw new ActionError(
            "A plugin with this name already exists. Please choose a different name or repository.",
          );
        }
        throw new ActionError(
          `Failed to create plugin: ${pluginError.message}`,
        );
      }

      type ComponentInput = z.infer<typeof componentSchema>;
      const componentRows = components.map((comp: ComponentInput, i: number) => ({
        plugin_id: plugin.id,
        type: comp.type,
        name: comp.name,
        slug:
          comp.slug ||
          comp.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        description: comp.description || null,
        content: comp.content || null,
        metadata: comp.metadata || {},
        sort_order: i,
      }));

      const { error: compError } = await supabase
        .from("plugin_components")
        .insert(componentRows);

      if (compError) {
        await supabase.from("plugins").delete().eq("id", plugin.id);
        throw new ActionError(
          `Failed to save plugin components: ${compError.message}`,
        );
      }

      // Queue an automated review. Cron picks this up and runs a Cursor cloud
      // agent against the plugin payload. Failure here is non-fatal: worst
      // case the plugin falls back to pure manual review.
      const { error: scanError } = await supabase
        .from("plugin_scans")
        .insert({ plugin_id: plugin.id, status: "queued" });
      if (scanError) {
        console.error("Failed to enqueue plugin scan:", scanError.message);
      }

      revalidatePath("/plugins");

      return { slug: plugin.slug };
    },
  );
