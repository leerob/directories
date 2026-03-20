import { CollectionActivityList } from "@/components/collections/collection-activity-list";
import { CollectionFollowButton } from "@/components/collections/collection-follow-button";
import { CollectionHero } from "@/components/collections/collection-hero";
import { CollectionItemCard } from "@/components/collections/collection-item-card";
import { CollectionCard } from "@/components/collections/collection-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CollectionSummary } from "@/data/collections";
import { getCollectionByUserAndSlug } from "@/data/collections";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string; collectionSlug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug, collectionSlug } = await params;
  const { data } = await getCollectionByUserAndSlug({
    ownerSlug: slug,
    collectionSlug,
  });

  if (!data) {
    return {
      title: "Collection",
    };
  }

  const title = `${data.title} by ${data.owner.name}`;
  return {
    title,
    description:
      data.description ??
      `A curated collection of ${data.item_count} items from ${data.owner.name}.`,
  };
}

export const revalidate = 300;

export default async function Page({ params }: { params: Params }) {
  const { slug, collectionSlug } = await params;
  const session = await getSession();
  const { data } = await getCollectionByUserAndSlug({
    ownerSlug: slug,
    collectionSlug,
    viewerId: session?.user?.id,
  });

  if (!data) {
    notFound();
  }

  return (
    <div className="page-shell pb-24 pt-24 md:pt-32">
      <CollectionHero
        title={data.title}
        description={data.description}
        owner={data.owner}
        items={data.items}
        itemCount={data.item_count}
        followerCount={data.follower_count}
        lastActivityAt={data.last_activity_at}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card rounded-[24px] border border-border p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Collection overview
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1.5">
                  {data.item_count} items
                </span>
                <span className="rounded-full border border-border px-3 py-1.5">
                  {data.follower_count} followers
                </span>
                <span className="rounded-full border border-border px-3 py-1.5">
                  Updated{" "}
                  {formatDistanceToNow(new Date(data.last_activity_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!data.is_owner && (
                <CollectionFollowButton
                  collectionId={data.id}
                  ownerSlug={data.owner.slug}
                  collectionSlug={data.slug}
                  initialIsFollowing={data.is_following}
                />
              )}

              {data.is_owner && (
                <Link href={`/u/${data.owner.slug}/collections/${data.slug}/edit`}>
                  <Button size="lg" variant="outline">
                    Edit collection
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[24px] border border-border p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Curated by
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-[12px] border border-border bg-muted">
              {data.owner.image ? (
                <img
                  src={data.owner.image}
                  alt={data.owner.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-foreground">
                  {data.owner.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm text-foreground">
                {data.owner.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                @{data.owner.slug}
              </div>
            </div>
          </div>
          <Separator className="my-5" />
          <Link href={`/u/${data.owner.slug}`}>
            <Button variant="outline" className="w-full">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-medium tracking-tight">
              Collection items
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Built from real plugin logos and linked back to the source plugin.
            </p>
          </div>

          <div className="space-y-4">
            {data.items.map((item, index) => (
              <CollectionItemCard
                key={`${item.entity_type}-${item.entity_id}`}
                item={item}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div>
            <h2 className="mb-4 text-xl font-medium tracking-tight">Activity</h2>
            <CollectionActivityList activities={data.activities} />
          </div>

          {data.related_collections.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-medium tracking-tight">
                More from {data.owner.name}
              </h2>
              <div className="space-y-4">
                {data.related_collections
                  .slice(0, 3)
                  .map((collection: CollectionSummary) => (
                    <CollectionCard key={collection.id} collection={collection} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
