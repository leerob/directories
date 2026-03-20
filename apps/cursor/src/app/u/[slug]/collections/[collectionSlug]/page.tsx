import { CollectionFollowButton } from "@/components/collections/collection-follow-button";
import { CollectionItemCard } from "@/components/collections/collection-item-card";
import { CollectionCard } from "@/components/collections/collection-card";
import type { CollectionSummary } from "@/data/collections";
import { getCollectionByUserAndSlug } from "@/data/collections";
import { formatCount } from "@/lib/utils";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    return { title: "Collection" };
  }

  return {
    title: `${data.title} by ${data.owner.name}`,
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
    <div className="min-h-screen px-4 pt-24 md:pt-32">
      <div className="page-shell max-w-4xl px-0 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/u/${data.owner.slug}`}>
            <Avatar className="size-10 rounded-lg border border-border bg-card">
              <AvatarImage
                src={data.owner.image ?? undefined}
                alt={data.owner.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-lg bg-card text-sm text-foreground">
                {data.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold tracking-tight">
                {data.title}
              </h1>
              <div className="flex items-center gap-2">
                {data.is_owner ? (
                  <>
                    <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                      <Users className="size-3.5" />
                      <span className="text-xs">
                        {formatCount(data.follower_count)}
                      </span>
                    </span>
                    <Link
                      href={`/u/${data.owner.slug}/collections/${data.slug}/edit`}
                      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                  </>
                ) : (
                  <CollectionFollowButton
                    collectionId={data.id}
                    ownerSlug={data.owner.slug}
                    collectionSlug={data.slug}
                    initialIsFollowing={data.is_following}
                    initialFollowerCount={data.follower_count}
                  />
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              by{" "}
              <Link
                href={`/u/${data.owner.slug}`}
                className="border-b border-dashed border-input text-foreground"
              >
                {data.owner.name}
              </Link>
            </p>
          </div>
        </div>

        {data.description && (
          <p className="mb-8 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            {data.description}
          </p>
        )}

        <div className="mb-10">
          <h2 className="section-eyebrow mb-4">
            {data.item_count} {data.item_count === 1 ? "item" : "items"}
          </h2>
          <div className="space-y-3">
            {data.items.map((item) => (
              <CollectionItemCard
                key={`${item.entity_type}-${item.entity_id}`}
                item={item}
              />
            ))}
          </div>
        </div>

        {data.related_collections.length > 0 && (
          <div>
            <h2 className="section-eyebrow mb-4">
              More from {data.owner.name}
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
  );
}
