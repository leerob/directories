import { CollectionShareActions } from "@/components/collections/collection-share-actions";
import { Button } from "@/components/ui/button";
import { getCollectionByUserAndSlug } from "@/data/collections";
import { buildCollectionShareModel } from "@/lib/collection-share";
import { getCollectionUrl } from "@/lib/collections";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
    return {
      title: "Share collection",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Share ${data.title}`,
    description: `Share ${data.title} and let more people discover it.`,
    alternates: {
      canonical: getCollectionUrl(data.owner.slug, data.slug),
    },
    robots: { index: false, follow: false },
  };
}

export const revalidate = 300;

export default async function Page({ params }: { params: Params }) {
  const { slug, collectionSlug } = await params;
  const session = await getSession();
  const collectionPath = getCollectionUrl(slug, collectionSlug);

  if (!session) {
    redirect(collectionPath);
  }

  const { data } = await getCollectionByUserAndSlug({
    ownerSlug: slug,
    collectionSlug,
    viewerId: session.user.id,
  });

  if (!data) {
    notFound();
  }

  if (!data.is_owner) {
    redirect(collectionPath);
  }

  const shareModel = buildCollectionShareModel(data);

  return (
    <div className="page-shell flex min-h-[80vh] flex-col items-center justify-center pb-24 pt-24 md:pt-32">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <h1 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            {shareModel.title}
          </h1>

          {shareModel.description && (
            <p className="mx-auto max-w-lg text-base leading-7 text-muted-foreground">
              {shareModel.description}
            </p>
          )}

        </div>

        <div className="flex items-center justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href={shareModel.urlPath}>
              View collection →
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border bg-card shadow-lg">
          <div className="relative aspect-[1200/630] w-full overflow-hidden bg-[#14120b]">
            <img
              src={`${shareModel.ogImagePath}?v=${Date.now()}`}
              alt={`${shareModel.title} social preview`}
              className="block size-full object-cover"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <CollectionShareActions
            path={shareModel.urlPath}
            title={shareModel.title}
            itemCount={shareModel.itemCount}
          />
        </div>
      </div>
    </div>
  );
}
