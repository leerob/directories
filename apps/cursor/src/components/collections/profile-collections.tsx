import type { CollectionSummary } from "@/data/collections";
import Link from "next/link";
import { Button } from "../ui/button";
import { getUserCollections } from "@/data/collections";
import { CollectionCard } from "./collection-card";

export async function ProfileCollections({
  userId,
  viewerId,
  isOwner,
}: {
  userId: string;
  viewerId?: string;
  isOwner: boolean;
}) {
  const { data } = await getUserCollections({
    ownerId: userId,
    viewerId,
    includePrivate: isOwner,
  });

  if (!data.length) {
    return (
      <div className="surface-card mt-6 flex h-full flex-col items-center justify-center rounded-lg py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {isOwner
            ? "Create your first collection to start curating plugins, MCPs, rules, and skills"
            : "No collections yet"}
        </p>
        {isOwner && (
          <Link href="/collections/new" className="mt-4">
            <Button variant="outline" className="rounded-full">
              Create collection
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            Collections
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated sets of plugins, MCPs, rules, and skills.
          </p>
        </div>

        {isOwner && (
          <Link href="/collections/new">
            <Button variant="outline" className="rounded-full">
              Create another collection
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((collection: CollectionSummary) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
