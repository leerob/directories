import { CollectionEditor } from "@/components/collections/collection-editor";
import { Login } from "@/components/login";
import { buildCollectionEditorOptions } from "@/data/collections";
import { getPopularCollectionSuggestions } from "@/lib/collections";
import { getPlugins } from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create collection",
  description:
    "Curate a public collection of plugins, MCPs, rules, and skills.",
};

export default async function Page() {
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

  const supabase = await createClient();
  const { data: plugins } = await getPlugins({ fetchAll: true });
  const { data: user } = await supabase
    .from("users")
    .select("name")
    .eq("id", session.user.id)
    .single();
  const availableItems = buildCollectionEditorOptions(plugins ?? []);
  const popularPicks = getPopularCollectionSuggestions(availableItems);
  const rawName =
    user?.name?.trim() ||
    (session.user.user_metadata.name as string | undefined)?.trim() ||
    "My";
  const name = rawName.length > 0 ? rawName : "My";
  const defaultTitle = `${name}'s Collection`;
  const defaultDescription = `A curated collection of plugins, MCPs, rules, and skills by ${name}.`;

  return (
    <div className="page-shell pb-20 pt-24 md:pt-32">
      <CollectionEditor
        availableItems={availableItems}
        popularPicks={popularPicks}
        defaultTitle={defaultTitle}
        defaultDescription={defaultDescription}
        ownerName={name}
      />
    </div>
  );
}
