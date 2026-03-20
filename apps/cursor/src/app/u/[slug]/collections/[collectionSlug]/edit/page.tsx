import { CollectionEditor } from "@/components/collections/collection-editor";
import { Login } from "@/components/login";
import { buildCollectionEditorOptions, getCollectionByUserAndSlug } from "@/data/collections";
import { getPlugins } from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

type Params = Promise<{ slug: string; collectionSlug: string }>;

export const metadata: Metadata = {
  title: "Edit collection",
  description: "Update a collection of plugins, MCPs, rules, and skills.",
};

export default async function Page({ params }: { params: Params }) {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={null}>
            <Login redirectTo="/collections/new" />
          </Suspense>
        </div>
      </div>
    );
  }

  const { slug, collectionSlug } = await params;
  const { data: collection } = await getCollectionByUserAndSlug({
    ownerSlug: slug,
    collectionSlug,
    viewerId: session.user.id,
  });

  if (!collection) {
    notFound();
  }

  if (!collection.is_owner) {
    redirect(`/u/${slug}/collections/${collectionSlug}`);
  }

  const { data: plugins } = await getPlugins({ fetchAll: true });
  const availableItems = buildCollectionEditorOptions(plugins ?? []);

  return (
    <div className="page-shell pb-20 pt-24 md:pt-32">
      <div className="mb-10 max-w-2xl space-y-3">
        <h1 className="marketing-page-title">Edit collection</h1>
        <p className="marketing-copy">
          Update items, notes, and ordering. Every meaningful change appears in
          the activity feed.
        </p>
      </div>

      <CollectionEditor
        availableItems={availableItems}
        initialCollection={{
          id: collection.id,
          title: collection.title,
          description: collection.description,
          visibility: collection.visibility,
          items: collection.items,
        }}
        ownerName={collection.owner.name}
      />
    </div>
  );
}
