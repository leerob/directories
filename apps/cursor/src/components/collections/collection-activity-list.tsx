import type { CollectionActivity } from "@/data/collections";
import { getCollectionTypeLabel, getCollectionUrl } from "@/lib/collections";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function eventBadge(activity: CollectionActivity) {
  switch (activity.event_type) {
    case "collection_created":
      return "Created";
    case "collection_updated":
      return "Updated";
    case "item_added":
      return "Added";
    case "item_removed":
      return "Removed";
    case "items_reordered":
      return "Reordered";
    default:
      return "Activity";
  }
}

function renderEvent(activity: CollectionActivity) {
  const actorName = activity.actor?.name ?? "Someone";

  switch (activity.event_type) {
    case "collection_created":
      return `${actorName} created this collection`;
    case "collection_updated":
      return `${actorName} updated the collection details`;
    case "item_added":
      return `${actorName} added ${activity.entity_title ?? "an item"} (${getCollectionTypeLabel(
        activity.entity_type ?? "plugin",
      )})`;
    case "item_removed":
      return `${actorName} removed ${activity.entity_title ?? "an item"}`;
    case "items_reordered":
      return `${actorName} reordered the collection`;
    default:
      return `${actorName} updated the collection`;
  }
}

export function CollectionActivityList({
  activities,
  showCollectionLink = false,
}: {
  activities: CollectionActivity[];
  showCollectionLink?: boolean;
}) {
  if (!activities.length) {
    return (
      <div className="surface-card rounded-[24px] border border-border p-6 text-sm text-muted-foreground">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="surface-card rounded-[20px] border border-border p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {eventBadge(activity)}
            </span>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm leading-6 text-foreground">
            <span>{renderEvent(activity)}</span>
            {showCollectionLink && activity.collection && (
              <>
                <span className="text-muted-foreground">in</span>
                <Link
                  href={getCollectionUrl(
                    activity.collection.owner.slug,
                    activity.collection.slug,
                  )}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {activity.collection.title}
                </Link>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
