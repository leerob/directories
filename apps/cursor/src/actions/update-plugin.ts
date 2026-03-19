"use server";

import { createClient } from "@/utils/supabase/admin-client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionError, authActionClient } from "./safe-action";

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

export const updatePluginAction = authActionClient
  .metadata({
    actionName: "update-plugin",
  })
  .inputSchema(
    z.object({
      id: z.uuid(),
      name: z.string().min(2, { error: "Name must be at least 2 characters" }),
      description: z
        .string()
        .min(10, { error: "Description must be at least 10 characters" }),
      logo: z.string().nullable().optional(),
      repository: z.url().nullable().optional(),
      homepage: z.url().nullable().optional(),
      keywords: z.array(z.string()).optional(),
      components: z
        .array(componentSchema)
        .min(1, { error: "At least one component is required" }),
    }),
  )
  .action(
    async ({
      parsedInput: {
        id,
        name,
        description,
        logo,
        repository,
        homepage,
        keywords,
        components,
      },
      ctx: { userId },
    }) => {
      const supabase = await createClient();

      const { data: existing, error: fetchError } = await supabase
        .from("plugins")
        .select("id, owner_id, slug")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        throw new ActionError("Plugin not found.");
      }

      if (existing.owner_id !== userId) {
        throw new ActionError("You do not have permission to edit this plugin.");
      }

      const { error: updateError } = await supabase
        .from("plugins")
        .update({
          name,
          description,
          logo: logo || null,
          repository: repository || null,
          homepage: homepage || null,
          keywords: keywords || [],
        })
        .eq("id", id);

      if (updateError) {
        if (updateError.code === "23505") {
          throw new ActionError(
            "A plugin with this name already exists. Please choose a different name.",
          );
        }
        throw new ActionError(
          `Failed to update plugin: ${updateError.message}`,
        );
      }

      const { error: deleteError } = await supabase
        .from("plugin_components")
        .delete()
        .eq("plugin_id", id);

      if (deleteError) {
        throw new ActionError(
          `Failed to update components: ${deleteError.message}`,
        );
      }

      type ComponentInput = z.infer<typeof componentSchema>;
      const componentRows = components.map(
        (comp: ComponentInput, i: number) => ({
          plugin_id: id,
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
        }),
      );

      const { error: compError } = await supabase
        .from("plugin_components")
        .insert(componentRows);

      if (compError) {
        throw new ActionError(
          `Failed to save plugin components: ${compError.message}`,
        );
      }

      revalidatePath("/plugins");
      revalidatePath(`/plugins/${existing.slug}`);

      return { slug: existing.slug };
    },
  );
