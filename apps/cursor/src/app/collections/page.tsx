import { CollectionsBrowse } from "@/components/collections/collections-browse";
import { Button } from "@/components/ui/button";
import { getPublicCollections } from "@/data/collections";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore user-curated collections of plugins, MCPs, rules, and skills.",
  openGraph: {
    title: "Collections | Cursor Directory",
    description:
      "Explore user-curated collections of plugins, MCPs, rules, and skills.",
  },
  twitter: {
    title: "Collections | Cursor Directory",
    description:
      "Explore user-curated collections of plugins, MCPs, rules, and skills.",
  },
};

export const revalidate = 300;

export default async function Page() {
  const session = await getSession();
  const { data: collections } = await getPublicCollections({
    viewerId: session?.user?.id,
  });

  return (
    <div className="page-shell pb-24 pt-24 md:pt-32">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="marketing-page-title">Collections</h1>
          <p className="marketing-copy max-w-2xl">
            Curated stacks of plugins, MCPs, rules, and skills built by the
            community.
          </p>
        </div>

        <Link href="/collections/new">
          <Button size="lg" className="rounded-full">
            Create collection
          </Button>
        </Link>
      </div>

      <CollectionsBrowse collections={collections} />
    </div>
  );
}
