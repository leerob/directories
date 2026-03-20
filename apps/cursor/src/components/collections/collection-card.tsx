import {
  getCollectionTypeLabel,
  getCollectionUrl,
} from "@/lib/collections";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { CollectionSummary } from "@/data/collections";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CollectionCard({
  collection,
}: {
  collection: CollectionSummary;
}) {
  const href = getCollectionUrl(collection.owner.slug, collection.slug);
  const types = [
    ...new Set(collection.preview_items.map((item) => item.entity_type)),
  ].slice(0, 3);

  return (
    <Link
      href={href}
      className="surface-card group block overflow-hidden rounded-[24px] border border-border transition-all hover:-translate-y-0.5 hover:border-input"
    >
      <div className="border-b border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-2.5 py-1">
            <Avatar className="size-5 rounded-[6px] border border-border bg-muted">
              <AvatarImage src={collection.owner.image ?? undefined} />
              <AvatarFallback className="rounded-[6px] bg-muted text-[10px] text-foreground">
                {collection.owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">@{collection.owner.slug}</span>
          </div>

          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1">
            {collection.item_count} items
          </span>
        </div>

        <div className="grid min-h-[160px] grid-cols-3 gap-3 rounded-[20px] bg-background p-3">
          {collection.preview_items.length > 0 ? (
            collection.preview_items.slice(0, 6).map((item) => (
              <div
                key={`${item.entity_type}-${item.entity_id}`}
                className="flex min-h-[54px] items-center justify-center rounded-[16px] border border-border bg-background/80 p-3"
                title={`${item.title} · ${getCollectionTypeLabel(item.entity_type)}`}
              >
                {item.plugin_logo ? (
                  <img
                    src={item.plugin_logo}
                    alt=""
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] uppercase text-muted-foreground">
                    {getCollectionTypeLabel(item.entity_type)}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 flex items-center justify-center rounded-[16px] border border-dashed border-border text-sm text-muted-foreground">
              Empty collection
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
              >
                {getCollectionTypeLabel(type)}
              </span>
            ))}
          </div>

          <h3 className="line-clamp-2 text-lg font-medium tracking-[0.005em] text-foreground">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {collection.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="size-8 rounded-[8px] border border-border bg-muted">
            <AvatarImage src={collection.owner.image ?? undefined} />
            <AvatarFallback className="rounded-[8px] bg-muted text-xs text-foreground">
              {collection.owner.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm text-foreground">
              {collection.owner.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              @{collection.owner.slug}
            </div>
          </div>
        </div>

        {collection.preview_items.length > 0 && (
          <div className="rounded-[18px] border border-border bg-card px-4 py-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              Included
            </p>
            <div className="space-y-1.5">
              {collection.preview_items.slice(0, 2).map((item) => (
                <div
                  key={`preview-${item.entity_type}-${item.entity_id}`}
                  className="truncate text-sm text-muted-foreground"
                >
                  <span className="text-foreground">{item.title}</span>
                  <span className="text-muted-foreground/80">
                    {" "}
                    · {getCollectionTypeLabel(item.entity_type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-2.5 py-1">
            {collection.item_count} items
          </span>
          <span className="rounded-full border border-border px-2.5 py-1">
            {collection.follower_count} followers
          </span>
          <span className="rounded-full border border-border px-2.5 py-1">
            Updated{" "}
            {formatDistanceToNow(new Date(collection.last_activity_at), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
