import { getCollectionItemHref, getCollectionTypeLabel } from "@/lib/collections";
import Link from "next/link";
import type { CollectionItemRecord } from "@/lib/collections";

export function CollectionItemCard({
  item,
  index,
}: {
  item: CollectionItemRecord;
  index: number;
}) {
  const href = getCollectionItemHref(item);
  const isPlugin = item.entity_type === "plugin";

  return (
    <div className="surface-card flex flex-col gap-4 rounded-[24px] border border-border p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs text-muted-foreground">
          {index + 1}
        </div>
        <div className="flex size-14 flex-shrink-0 items-center justify-center rounded-[16px] border border-border bg-muted p-3">
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

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {getCollectionTypeLabel(item.entity_type)}
            </span>
            {!isPlugin && (
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                from {item.plugin_name}
              </span>
            )}
          </div>

          <h3 className="text-base font-medium tracking-[0.005em] text-foreground">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {item.note && (
        <div className="rounded-[18px] border border-border bg-card px-4 py-3">
          <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Curator note
          </p>
          <p className="text-sm leading-6 text-muted-foreground">{item.note}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="min-w-0">
          <div className="truncate text-muted-foreground">
            {isPlugin ? "Full plugin" : item.plugin_name}
          </div>
          {!isPlugin && (
            <div className="mt-1 truncate text-xs text-muted-foreground/70">
              Linked from the parent plugin page
            </div>
          )}
        </div>

        <Link
          href={href}
          className="rounded-full border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-accent"
        >
          View source
        </Link>
      </div>
    </div>
  );
}
