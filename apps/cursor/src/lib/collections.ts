import slugify from "slugify";

export const COLLECTION_ENTITY_TYPES = [
  "plugin",
  "mcp_server",
  "rule",
  "skill",
] as const;

export type CollectionEntityType = (typeof COLLECTION_ENTITY_TYPES)[number];

export const COLLECTION_VISIBILITIES = ["public", "private"] as const;

export type CollectionVisibility = (typeof COLLECTION_VISIBILITIES)[number];

export const COLLECTION_EVENT_TYPES = [
  "collection_created",
  "collection_updated",
  "item_added",
  "item_removed",
  "items_reordered",
] as const;

export type CollectionEventType = (typeof COLLECTION_EVENT_TYPES)[number];

export type CollectionOwner = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

export type CollectionEditorOption = {
  entity_type: CollectionEntityType;
  entity_id: string;
  plugin_id: string;
  title: string;
  slug: string;
  description: string | null;
  plugin_name: string;
  plugin_slug: string;
  plugin_logo: string | null;
};

export type CollectionItemRecord = CollectionEditorOption & {
  id: string;
  collection_id: string;
  note: string | null;
  position: number;
  created_at: string;
  updated_at?: string;
};

export function createCollectionSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  }).slice(0, 48);
}

export function getCollectionUrl(ownerSlug: string, collectionSlug: string) {
  return `/u/${ownerSlug}/collections/${collectionSlug}`;
}

export function getCollectionTypeLabel(entityType: CollectionEntityType) {
  switch (entityType) {
    case "plugin":
      return "Plugin";
    case "mcp_server":
      return "MCP";
    case "rule":
      return "Rule";
    case "skill":
      return "Skill";
    default:
      return "Item";
  }
}

export function getCollectionItemHref(item: {
  plugin_slug: string;
  entity_type: CollectionEntityType;
}) {
  return `/plugins/${item.plugin_slug}`;
}

export function dedupeCollectionLogos(
  items: Array<{ plugin_id: string; plugin_logo: string | null }>,
  limit = 6,
) {
  const seen = new Set<string>();
  const logos: string[] = [];

  for (const item of items) {
    if (!item.plugin_logo || seen.has(item.plugin_id)) {
      continue;
    }

    seen.add(item.plugin_id);
    logos.push(item.plugin_logo);

    if (logos.length >= limit) {
      break;
    }
  }

  return logos;
}

export function compareCollectionItems(
  a: { entity_type: CollectionEntityType; entity_id: string },
  b: { entity_type: CollectionEntityType; entity_id: string },
) {
  return a.entity_type === b.entity_type && a.entity_id === b.entity_id;
}
