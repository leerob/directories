import {
  COLLECTION_ENTITY_TYPES,
  type CollectionEditorOption,
  type CollectionEventType,
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
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  owner: CollectionOwner;
  preview_items: CollectionItemRecord[];
  is_following: boolean;
};

export type CollectionActivity = {
  id: string;
  collection_id: string;
  actor_user_id: string;
  event_type: CollectionEventType;
  entity_type: CollectionItemRecord["entity_type"] | null;
  entity_id: string | null;
  entity_title: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor: CollectionOwner | null;
  collection: Pick<CollectionSummary, "id" | "slug" | "title" | "owner"> | null;
};

export type CollectionDetail = CollectionSummary & {
  items: CollectionItemRecord[];
  activities: CollectionActivity[];
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
    last_activity_at: row.last_activity_at,
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
      });
    }
  }

  return options.sort((a, b) => {
    if (a.entity_type === "plugin" && b.entity_type !== "plugin") return -1;
    if (a.entity_type !== "plugin" && b.entity_type === "plugin") return 1;
    return a.title.localeCompare(b.title);
  });
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
      "id, owner_id, slug, title, description, visibility, follower_count, item_count, last_activity_at, created_at, updated_at, owner:owner_id(id, name, slug, image)",
    )
    .eq("visibility", "public")
    .order("last_activity_at", { ascending: false });

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
      "id, owner_id, slug, title, description, visibility, follower_count, item_count, last_activity_at, created_at, updated_at, owner:owner_id(id, name, slug, image)",
    )
    .eq("owner_id", ownerId)
    .order("last_activity_at", { ascending: false });

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

  const [itemsMap, following, eventsResult, relatedResult] = await Promise.all([
    getCollectionItemsMap([collectionRow.id]),
    getCollectionFollowingSet([collectionRow.id], viewerId),
    getCollectionActivities([collectionRow.id]),
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
      activities: eventsResult.data.filter(
        (event) => event.collection_id === collectionRow.id,
      ),
      related_collections,
      is_owner: viewerId === owner.id,
    } satisfies CollectionDetail,
  };
}

export async function getCollectionActivities(collectionIds: string[]) {
  if (!collectionIds.length) {
    return { data: [] as CollectionActivity[] };
  }

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("collection_events")
    .select("*")
    .in("collection_id", collectionIds)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = events ?? [];
  const actorIds = [...new Set(rows.map((row) => row.actor_user_id).filter(Boolean))];
  const uniqueCollectionIds = [...new Set(rows.map((row) => row.collection_id))];

  const [{ data: actors }, { data: collections }] = await Promise.all([
    actorIds.length
      ? supabase
          .from("users")
          .select("id, name, slug, image")
          .in("id", actorIds)
      : Promise.resolve({ data: [] }),
    uniqueCollectionIds.length
      ? supabase
          .from("collections")
          .select("id, slug, title, owner:owner_id(id, name, slug, image)")
          .in("id", uniqueCollectionIds)
      : Promise.resolve({ data: [] }),
  ]);

  const actorMap = new Map<string, CollectionOwner>();
  for (const actor of actors ?? []) {
    actorMap.set(actor.id, normalizeOwner(actor));
  }

  const collectionMap = new Map<
    string,
    Pick<CollectionSummary, "id" | "slug" | "title" | "owner">
  >();
  for (const collection of collections ?? []) {
    collectionMap.set(collection.id, {
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      owner: normalizeOwner(collection.owner),
    });
  }

  return {
    data: rows.map(
      (row) =>
        ({
          ...row,
          actor: actorMap.get(row.actor_user_id) ?? null,
          collection: collectionMap.get(row.collection_id) ?? null,
        }) satisfies CollectionActivity,
    ),
  };
}

export async function getFeedForUser(userId: string) {
  const supabase = await createClient();

  const [{ data: followedUsers }, { data: followedCollections }] = await Promise.all([
    supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", userId),
    supabase
      .from("collection_follows")
      .select("collection_id")
      .eq("user_id", userId),
  ]);

  const followedUserIds = (followedUsers ?? []).map((row) => row.following_id);
  const followedCollectionIds = (followedCollections ?? []).map(
    (row) => row.collection_id,
  );

  const queries: any[] = [];

  if (followedUserIds.length) {
    queries.push(
      supabase
        .from("collection_events")
        .select("*")
        .in("actor_user_id", followedUserIds)
        .order("created_at", { ascending: false })
        .limit(40),
    );
  }

  if (followedCollectionIds.length) {
    queries.push(
      supabase
        .from("collection_events")
        .select("*")
        .in("collection_id", followedCollectionIds)
        .order("created_at", { ascending: false })
        .limit(40),
    );
  }

  if (!queries.length) {
    return { data: [] as CollectionActivity[] };
  }

  const results = await Promise.all(queries);
  const merged = new Map<string, any>();

  for (const result of results) {
    for (const row of result.data ?? []) {
      merged.set(row.id, row);
    }
  }

  const sorted = [...merged.values()]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 50);

  const activities = await getCollectionActivities(
    [...new Set(sorted.map((row) => row.collection_id))],
  );

  const activityMap = new Map(activities.data.map((item) => [item.id, item]));

  return {
    data: sorted
      .map((row) => activityMap.get(row.id))
      .filter(Boolean) as CollectionActivity[],
  };
}
