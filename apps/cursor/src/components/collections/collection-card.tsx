import { getCollectionUrl } from "@/lib/collections";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount } from "@/lib/utils";
import Link from "next/link";
import type { CollectionSummary } from "@/data/collections";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CollectionCard({
  collection,
}: {
  collection: CollectionSummary;
}) {
  const href = getCollectionUrl(collection.owner.slug, collection.slug);

  return (
    <Link href={href}>
      <Card className="h-[156px] overflow-hidden border-border bg-transparent transition-colors hover:border-input hover:bg-transparent">
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 flex-shrink-0 rounded-[4px] border border-border bg-muted">
              <AvatarImage
                src={collection.owner.image ?? undefined}
                alt={collection.owner.name}
                className="object-cover"
              />
              <AvatarFallback className="rounded-[4px] bg-muted text-xs text-foreground">
                {collection.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium tracking-[0.005em] text-foreground">
                {collection.title}
              </h3>
              <p className="truncate text-xs text-muted-foreground">
                @{collection.owner.slug}
              </p>
            </div>
          </div>

          <p className="line-clamp-2 flex-1 text-[13px] leading-5 text-muted-foreground">
            {collection.description ?? `A collection of ${collection.item_count} items.`}
          </p>

          <div className="mt-auto flex items-center gap-2">
            <span className="rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              {collection.item_count} {collection.item_count === 1 ? "item" : "items"}
            </span>
            {collection.follower_count > 0 && (
              <span className="rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {formatCount(collection.follower_count)} {collection.follower_count === 1 ? "follower" : "followers"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
