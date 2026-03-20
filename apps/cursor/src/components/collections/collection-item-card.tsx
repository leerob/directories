import { getCollectionItemHref, getCollectionTypeLabel } from "@/lib/collections";
import Link from "next/link";
import type { CollectionItemRecord } from "@/lib/collections";
import { PluginIconFallback } from "../plugins/plugin-icon";
import { AddToCollectionButton } from "./add-to-collection-button";

export function CollectionItemCard({
  item,
}: {
  item: CollectionItemRecord;
  index?: number;
}) {
  const href = getCollectionItemHref(item);
  const isPlugin = item.entity_type === "plugin";

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <Link href={href} className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card p-1">
          {item.plugin_logo ? (
            <img
              src={item.plugin_logo}
              alt=""
              className="max-h-6 max-w-full object-contain"
            />
          ) : (
            <PluginIconFallback size={24} bordered={false} transparent />
          )}
        </div>

        <div className="min-w-0">
          <span className="truncate text-sm font-medium text-foreground">
            {item.title}
          </span>
          {!isPlugin && (
            <span className="ml-2 text-xs text-muted-foreground">
              {getCollectionTypeLabel(item.entity_type)}
            </span>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <AddToCollectionButton
          item={{
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            plugin_id: item.plugin_id,
            title: item.title,
            slug: item.slug,
            description: item.description,
            plugin_name: item.plugin_name,
            plugin_slug: item.plugin_slug,
            plugin_logo: item.plugin_logo,
          }}
        />
        <Link
          href={href}
          className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Add to Cursor
        </Link>
      </div>
    </div>
  );
}
