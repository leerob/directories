"use server";

import {
  COLLECTION_ENTITY_TYPES,
  COLLECTION_VISIBILITIES,
  compareCollectionItems,
  createCollectionSlug,
  getCollectionUrl,
} from "@/lib/collections";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ActionError, authActionClient } from "./safe-action";

const collectionItemSchema = z.object({
  entity_type: z.enum(COLLECTION_ENTITY_TYPES),
  entity_id: z.string().uuid(),
  plugin_id: z.string().uuid(),
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  plugin_name: z.string().min(1).max(120),
  plugin_slug: z.string().min(1).max(120),
  plugin_logo: z.string().url().nullable(),
  note: z.string().max(300).nullable(),
});

const collectionSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(600).nullable(),
  visibility: z.enum(COLLECTION_VISIBILITIES),
  items: z.array(collectionItemSchema).min(1).max(64),
});

type CollectionItemInput = z.infer<typeof collectionItemSchema>;

async function ensureUniqueCollectionSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  title: string,
  excludeId?: string,
) {
  const baseSlug = createCollectionSlug(title) || "collection";
  const { data } = await supabase
    .from("collections")
    .select("id, slug")
    .eq("owner_id", ownerId)
    .like("slug", `${baseSlug}%`);

  const used = new Set(
    (data ?? [])
      .filter((row) => row.id !== excludeId)
      .map((row) => row.slug),
  );

  if (!used.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  while (used.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

async function insertCollectionEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  collectionId: string,
  actorUserId: string,
  events: Array<{
    event_type:
      | "collection_created"
      | "collection_updated"
      | "item_added"
      | "item_removed"
      | "items_reordered";
    entity_type?: string | null;
    entity_id?: string | null;
    entity_title?: string | null;
    metadata?: Record<string, unknown>;
  }>,
) {
  if (!events.length) {
    return;
  }

  const rows = events.map((event) => ({
    collection_id: collectionId,
    actor_user_id: actorUserId,
    event_type: event.event_type,
    entity_type: event.entity_type ?? null,
    entity_id: event.entity_id ?? null,
    entity_title: event.entity_title ?? null,
    metadata: event.metadata ?? {},
  }));

  const { error } = await supabase.from("collection_events").insert(rows);

  if (error) {
    throw new ActionError(error.message);
  }
}

function withPositions(items: CollectionItemInput[], collectionId: string) {
  return items.map((item, index) => ({
    collection_id: collectionId,
    entity_type: item.entity_type,
    entity_id: item.entity_id,
    plugin_id: item.plugin_id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    plugin_name: item.plugin_name,
    plugin_slug: item.plugin_slug,
    plugin_logo: item.plugin_logo,
    note: item.note ?? null,
    position: index,
  }));
}

export const createCollectionAction = authActionClient
  .metadata({
    actionName: "create-collection",
  })
  .schema(collectionSchema)
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("id, slug")
      .eq("id", userId)
      .single();

    if (ownerError || !owner) {
      throw new ActionError("Unable to load your profile");
    }

    const slug = await ensureUniqueCollectionSlug(supabase, userId, parsedInput.title);

    const { data: collection, error } = await supabase
      .from("collections")
      .insert({
        owner_id: userId,
        slug,
        title: parsedInput.title,
        description: parsedInput.description,
        visibility: parsedInput.visibility,
      })
      .select("id, slug")
      .single();

    if (error || !collection) {
      throw new ActionError(error?.message ?? "Unable to create collection");
    }

    const itemRows = withPositions(parsedInput.items, collection.id);
    const { error: itemsError } = await supabase
      .from("collection_items")
      .insert(itemRows);

    if (itemsError) {
      throw new ActionError(itemsError.message);
    }

    await insertCollectionEvents(supabase, collection.id, userId, [
      {
        event_type: "collection_created",
        metadata: { item_count: parsedInput.items.length },
      },
    ]);

    const path = getCollectionUrl(owner.slug, collection.slug);
    revalidatePath("/collections");
    revalidatePath(`/u/${owner.slug}`);
    revalidatePath(path);
    redirect(path);
  });

export const updateCollectionAction = authActionClient
  .metadata({
    actionName: "update-collection",
  })
  .schema(
    collectionSchema.extend({
      collectionId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const supabase = await createClient();

    const { data: collection, error: collectionError } = await supabase
      .from("collections")
      .select("id, owner_id, slug, title, description, visibility")
      .eq("id", parsedInput.collectionId)
      .single();

    if (collectionError || !collection) {
      throw new ActionError("Collection not found");
    }

    if (collection.owner_id !== userId) {
      throw new ActionError("You do not have permission to edit this collection");
    }

    const { data: owner } = await supabase
      .from("users")
      .select("slug")
      .eq("id", userId)
      .single();

    if (!owner) {
      throw new ActionError("Unable to load your profile");
    }

    const { data: existingItems } = await supabase
      .from("collection_items")
      .select("entity_type, entity_id, title, position")
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    const incomingItems = parsedInput.items.map((item, index) => ({
      ...item,
      position: index,
    }));

    const addedItems = incomingItems.filter(
      (item) =>
        !(existingItems ?? []).some((existing) => compareCollectionItems(existing, item)),
    );

    const removedItems = (existingItems ?? []).filter(
      (existing) =>
        !incomingItems.some((item) => compareCollectionItems(existing, item)),
    );

    const isReordered =
      addedItems.length === 0 &&
      removedItems.length === 0 &&
      (existingItems ?? []).some(
        (existing, index) =>
          existing.position !== incomingItems[index]?.position ||
          !compareCollectionItems(existing, incomingItems[index]),
      );

    const collectionChanged =
      collection.title !== parsedInput.title ||
      (collection.description ?? null) !== parsedInput.description ||
      collection.visibility !== parsedInput.visibility;

    const { error: updateError } = await supabase
      .from("collections")
      .update({
        title: parsedInput.title,
        description: parsedInput.description,
        visibility: parsedInput.visibility,
      })
      .eq("id", collection.id);

    if (updateError) {
      throw new ActionError(updateError.message);
    }

    const rows = withPositions(parsedInput.items, collection.id);
    const { error: upsertError } = await supabase
      .from("collection_items")
      .upsert(rows, {
        onConflict: "collection_id,entity_type,entity_id",
      });

    if (upsertError) {
      throw new ActionError(upsertError.message);
    }

    for (const item of removedItems) {
      const { error: deleteError } = await supabase
        .from("collection_items")
        .delete()
        .eq("collection_id", collection.id)
        .eq("entity_type", item.entity_type)
        .eq("entity_id", item.entity_id);

      if (deleteError) {
        throw new ActionError(deleteError.message);
      }
    }

    const events: Parameters<typeof insertCollectionEvents>[3] = [];

    if (collectionChanged) {
      events.push({
        event_type: "collection_updated",
      });
    }

    if (isReordered) {
      events.push({
        event_type: "items_reordered",
        metadata: { item_count: incomingItems.length },
      });
    }

    for (const item of addedItems) {
      events.push({
        event_type: "item_added",
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        entity_title: item.title,
      });
    }

    for (const item of removedItems) {
      events.push({
        event_type: "item_removed",
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        entity_title: item.title,
      });
    }

    await insertCollectionEvents(supabase, collection.id, userId, events);

    const path = getCollectionUrl(owner.slug, collection.slug);
    revalidatePath("/collections");
    revalidatePath(`/u/${owner.slug}`);
    revalidatePath(path);
    redirect(path);
  });
