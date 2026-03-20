import {
  COLLECTION_ENTITY_TYPES,
  compareCollectionEditorOptions,
  type CollectionEditorOption,
  type CollectionItemRecord,
  type CollectionOwner,
  type CollectionVisibility,
} from "@/lib/collections";
import { createClient } from "@/utils/supabase/admin-client";
import type { PluginRow } from "./queries";

export type CollectionSummary = {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  description: string | null;
  visibility: CollectionVisibility;
  follower_count: number;
  item_count: number;
  created_at: string;
  updated_at: string;
  owner: CollectionOwner;
  preview_items: CollectionItemRecord[];
  is_following: boolean;
};

export type CollectionDetail = CollectionSummary & {
  items: CollectionItemRecord[];
  related_collections: CollectionSummary[];
  is_owner: boolean;
};

function sortItems(items: CollectionItemRecord[]) {
  return [...items].sort((a, b) => a.position - b.position);
}

function normalizeOwner(owner: any): CollectionOwner {
  return {
    id: owner?.id ?? "",
    name: owner?.name ?? "Unknown user",
    slug: owner?.slug ?? "",
    image: owner?.image ?? null,
  };
}

async function getCollectionItemsMap(collectionIds: string[]) {
  if (!collectionIds.length) {
    return new Map<string, CollectionItemRecord[]>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("collection_items")
    .select("*")
    .in("collection_id", collectionIds)
    .order("position", { ascending: true });

  const map = new Map<string, CollectionItemRecord[]>();

  for (const row of (data ?? []) as CollectionItemRecord[]) {
    const current = map.get(row.collection_id) ?? [];
    current.push(row);
    map.set(row.collection_id, current);
  }

  return map;
}

async function getCollectionFollowingSet(
  collectionIds: string[],
  viewerId?: string,
) {
  const set = new Set<string>();

  if (!viewerId || !collectionIds.length) {
    return set;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("collection_follows")
    .select("collection_id")
    .eq("user_id", viewerId)
    .in("collection_id", collectionIds);

  for (const row of data ?? []) {
    set.add(row.collection_id);
  }

  return set;
}

function normalizeCollectionRow(
  row: any,
  items: Map<string, CollectionItemRecord[]>,
  following: Set<string>,
): CollectionSummary {
  return {
    id: row.id,
    owner_id: row.owner_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    follower_count: row.follower_count ?? 0,
    item_count: row.item_count ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner: normalizeOwner(row.owner),
    preview_items: sortItems(items.get(row.id) ?? []).slice(0, 6),
    is_following: following.has(row.id),
  };
}

async function fetchCollectionsByQuery(
  query: any,
  viewerId?: string,
) {
  const { data } = await query;
  const rows: any[] = data ?? [];
  const collectionIds = rows.map((row: any) => row.id);

  const [items, following] = await Promise.all([
    getCollectionItemsMap(collectionIds),
    getCollectionFollowingSet(collectionIds, viewerId),
  ]);

  return rows.map((row: any) => normalizeCollectionRow(row, items, following));
}

export function buildCollectionEditorOptions(plugins: PluginRow[]) {
  const allowed = new Set<string>(COLLECTION_ENTITY_TYPES);
  const options: CollectionEditorOption[] = [];

  for (const plugin of plugins) {
    const popularity_score = plugin.install_count;

    options.push({
      entity_type: "plugin",
      entity_id: plugin.id,
      plugin_id: plugin.id,
      title: plugin.name,
      slug: plugin.slug,
      description: plugin.description,
      plugin_name: plugin.name,
      plugin_slug: plugin.slug,
      plugin_logo: plugin.logo,
      popularity_score,
    });

    for (const component of plugin.plugin_components ?? []) {
      if (!allowed.has(component.type)) {
        continue;
      }

      options.push({
        entity_type: component.type as CollectionEditorOption["entity_type"],
        entity_id: component.id,
        plugin_id: plugin.id,
        title: component.name,
        slug: component.slug,
        description: component.description,
        plugin_name: plugin.name,
        plugin_slug: plugin.slug,
        plugin_logo: plugin.logo,
        popularity_score,
      });
    }
  }

  return options.sort(compareCollectionEditorOptions);
}

export async function getPublicCollections({
  limit,
  viewerId,
}: {
  limit?: number;
  viewerId?: string;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("collections")
    .select(
      "id, owner_id, slug, title, description, visibility, follower_count, item_count, created_at, updated_at, owner:owner_id(id, name, slug, image)",
    )
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const collections = await fetchCollectionsByQuery(query, viewerId);
  return { data: collections };
}

export async function getUserCollections({
  ownerId,
  viewerId,
  includePrivate = false,
}: {
  ownerId: string;
  viewerId?: string;
  includePrivate?: boolean;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("collections")
    .select(
      "id, owner_id, slug, title, description, visibility, follower_count, item_count, created_at, updated_at, owner:owner_id(id, name, slug, image)",
    )
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (!includePrivate) {
    query = query.eq("visibility", "public");
  }

  const collections = await fetchCollectionsByQuery(query, viewerId);
  return { data: collections };
}

export async function getCollectionByUserAndSlug({
  ownerSlug,
  collectionSlug,
  viewerId,
}: {
  ownerSlug: string;
  collectionSlug: string;
  viewerId?: string;
}) {
  const supabase = await createClient();
  const { data: owner } = await supabase
    .from("users")
    .select("id, name, slug, image")
    .eq("slug", ownerSlug)
    .single();

  if (!owner) {
    return { data: null as CollectionDetail | null };
  }

  let query = supabase
    .from("collections")
    .select("*")
    .eq("owner_id", owner.id)
    .eq("slug", collectionSlug);

  if (viewerId !== owner.id) {
    query = query.eq("visibility", "public");
  }

  const { data: collectionRow } = await query.single();

  if (!collectionRow) {
    return { data: null as CollectionDetail | null };
  }

  const [itemsMap, following, relatedResult] = await Promise.all([
    getCollectionItemsMap([collectionRow.id]),
    getCollectionFollowingSet([collectionRow.id], viewerId),
    getUserCollections({
      ownerId: owner.id,
      viewerId,
      includePrivate: viewerId === owner.id,
    }),
  ]);

  const summary = normalizeCollectionRow(
    {
      ...collectionRow,
      owner,
    },
    itemsMap,
    following,
  );

  const related_collections = (relatedResult.data ?? []).filter(
    (item: CollectionSummary) => item.id !== collectionRow.id,
  );

  return {
    data: {
      ...summary,
      items: sortItems(itemsMap.get(collectionRow.id) ?? []),
      related_collections,
      is_owner: viewerId === owner.id,
    } satisfies CollectionDetail,
  };
}
