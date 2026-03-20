import {
  dedupeCollectionLogos,
  getCollectionOpenGraphImageUrl,
  getCollectionShareUrl,
  getCollectionUrl,
} from "@/lib/collections";

type ShareCollectionInput = {
  slug: string;
  title: string;
  description: string | null;
  item_count: number;
  follower_count: number;
  owner: {
    name: string;
    slug: string;
  };
  items: Array<{
    plugin_id: string;
    plugin_logo: string | null;
  }>;
};

export type CollectionShareModel = {
  title: string;
  ownerName: string;
  ownerSlug: string;
  description: string | null;
  shortDescription: string | null;
  itemCount: number;
  followerCount: number;
  urlPath: string;
  sharePath: string;
  ogImagePath: string;
  logos: string[];
};

export function buildCollectionShareModel(
  collection: ShareCollectionInput,
): CollectionShareModel {
  const urlPath = getCollectionUrl(collection.owner.slug, collection.slug);
  const description = collection.description?.trim() || null;

  return {
    title: collection.title,
    ownerName: collection.owner.name,
    ownerSlug: collection.owner.slug,
    description,
    shortDescription:
      description && description.length > 110
        ? `${description.slice(0, 110)}...`
        : description,
    itemCount: collection.item_count,
    followerCount: collection.follower_count,
    urlPath,
    sharePath: getCollectionShareUrl(collection.owner.slug, collection.slug),
    ogImagePath: getCollectionOpenGraphImageUrl(
      collection.owner.slug,
      collection.slug,
    ),
    logos: dedupeCollectionLogos(collection.items, 6),
  };
}

export function getCollectionShareText(model: {
  title: string;
  itemCount: number;
}) {
  const itemLabel = model.itemCount === 1 ? "item" : "items";
  return `I just published "${model.title}" on Cursor Directory. It curates ${model.itemCount} ${itemLabel} in one place.`;
}
