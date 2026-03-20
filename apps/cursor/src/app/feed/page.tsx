import { CollectionActivityList } from "@/components/collections/collection-activity-list";
import { Login } from "@/components/login";
import { getFeedForUser } from "@/data/collections";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Feed",
  description: "Recent collection updates from people and collections you follow.",
};

export const revalidate = 60;

export default async function Page() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Suspense fallback={null}>
            <Login redirectTo="/feed" />
          </Suspense>
        </div>
      </div>
    );
  }

  const { data } = await getFeedForUser(session.user.id);

  return (
    <div className="page-shell pb-24 pt-24 md:pt-32">
      <div className="mb-10 max-w-2xl space-y-3">
        <h1 className="marketing-page-title">Feed</h1>
        <p className="marketing-copy">
          Keep up with new collections and updates from the curators you follow.
        </p>
      </div>

      <CollectionActivityList activities={data} showCollectionLink />
    </div>
  );
}
