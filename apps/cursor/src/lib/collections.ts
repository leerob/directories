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
  popularity_score?: number;
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

export function getCollectionShareUrl(ownerSlug: string, collectionSlug: string) {
  return `${getCollectionUrl(ownerSlug, collectionSlug)}/share`;
}

export function getCollectionOpenGraphImageUrl(
  ownerSlug: string,
  collectionSlug: string,
) {
  return `${getCollectionUrl(ownerSlug, collectionSlug)}/opengraph-image`;
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

export function getCollectionBrowseScore(option: CollectionEditorOption) {
  return (option.popularity_score ?? 0) + (option.plugin_logo ? 500 : 0);
}

export function compareCollectionEditorOptions(
  a: CollectionEditorOption,
  b: CollectionEditorOption,
) {
  const scoreDiff = getCollectionBrowseScore(b) - getCollectionBrowseScore(a);
  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  if (!!a.plugin_logo !== !!b.plugin_logo) {
    return a.plugin_logo ? -1 : 1;
  }

  return a.title.localeCompare(b.title);
}

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededUnit(seed: string, key: string) {
  const hash = hashString(`${seed}:${key}`);
  return (hash % 1000000) / 1000000;
}

export function getRandomizedCollectionEditorOptions(
  options: CollectionEditorOption[],
  seed: string,
) {
  return [...options].sort((a, b) => {
    const aKey = `${a.entity_type}:${a.entity_id}`;
    const bKey = `${b.entity_type}:${b.entity_id}`;
    const aRandom = Math.max(seededUnit(seed, aKey), 0.000001);
    const bRandom = Math.max(seededUnit(seed, bKey), 0.000001);
    const aWeight = Math.max(1, getCollectionBrowseScore(a));
    const bWeight = Math.max(1, getCollectionBrowseScore(b));
    const aShuffleScore = -Math.log(aRandom) / aWeight;
    const bShuffleScore = -Math.log(bRandom) / bWeight;

    if (aShuffleScore !== bShuffleScore) {
      return aShuffleScore - bShuffleScore;
    }

    return compareCollectionEditorOptions(a, b);
  });
}

function pickRandomWeighted(
  options: CollectionEditorOption[],
): CollectionEditorOption | null {
  if (!options.length) {
    return null;
  }

  const weighted = options.map((option) => ({
    option,
    score: Math.max(1, getCollectionBrowseScore(option)),
  }));

  const total = weighted.reduce((sum, item) => sum + item.score, 0);
  let threshold = Math.random() * total;

  for (const item of weighted) {
    threshold -= item.score;
    if (threshold <= 0) {
      return item.option;
    }
  }

  return weighted[0]?.option ?? null;
}

export function getPopularCollectionSuggestions(
  options: CollectionEditorOption[],
  limit = 4,
) {
  const selected: CollectionEditorOption[] = [];
  const seen = new Set<string>();
  const ranked = [...options].sort(compareCollectionEditorOptions);

  const addOption = (option: CollectionEditorOption | null) => {
    if (!option) {
      return;
    }

    const key = `${option.entity_type}:${option.entity_id}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    selected.push(option);
  };

  for (const type of ["plugin", "mcp_server", "rule", "skill"] as const) {
    const candidates = ranked
      .filter((option) => option.entity_type === type)
      .slice(0, 8);
    addOption(pickRandomWeighted(candidates));
  }

  const remaining = ranked.filter(
    (option) => !seen.has(`${option.entity_type}:${option.entity_id}`),
  );

  while (selected.length < limit && remaining.length > 0) {
    const next = pickRandomWeighted(remaining.slice(0, 16));
    addOption(next);

    if (!next) {
      break;
    }

    const nextKey = `${next.entity_type}:${next.entity_id}`;
    const index = remaining.findIndex(
      (option) => `${option.entity_type}:${option.entity_id}` === nextKey,
    );

    if (index >= 0) {
      remaining.splice(index, 1);
    }
  }

  return selected.slice(0, limit);
}
