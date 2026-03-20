import { getUserProfile } from "@/data/queries";
import { getSession } from "@/utils/supabase/auth";
import { format } from "date-fns";
import { Suspense } from "react";
import { ProfileCollections } from "../collections/profile-collections";
import { ProfileCompanies } from "./profile-companies";
import { ProfileContent } from "./profile-content";
import { ProfilePlugins } from "./profile-plugins";
import { ProfilePosts } from "./profile-posts";
import { ProfileStarredPlugins } from "./profile-starred-plugins";
import { ProfileTabs } from "./profile-tabs";
import { ProfileTop } from "./profile-top";

export async function Profile({
  slug,
  isProfilePage = false,
}: {
  slug: string;
  isProfilePage?: boolean;
}) {
  const session = await getSession();
  const { data } = await getUserProfile(
    slug,
    isProfilePage ? session?.user?.id : undefined,
  );

  const isOwner = session?.user?.id === data?.id;

  if (!data) {
    return (
      <div className="flex justify-center items-center -mt-28 w-full h-screen text-sm text-[#878787]">
        User not found
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileTop data={data} isOwner={isOwner} />

      <ProfileContent
        bio={data?.bio}
        work={data?.work}
        website={data?.website}
        social_x_link={data?.social_x_link}
      />

      <ProfileTabs>
        {{
          posts: (
            // @ts-ignore
            <ProfilePosts data={data?.posts} isOwner={isOwner} />
          ),
          plugins: (
            <Suspense fallback={<div>Loading...</div>}>
              <ProfilePlugins userId={data?.id} isOwner={isOwner} />
            </Suspense>
          ),
          collections: (
            <Suspense fallback={<div>Loading...</div>}>
              <ProfileCollections
                userId={data?.id}
                viewerId={session?.user?.id}
                isOwner={isOwner}
              />
            </Suspense>
          ),
          companies: (
            <Suspense fallback={<div>Loading...</div>}>
              <ProfileCompanies userId={data?.id} isOwner={isOwner} />
            </Suspense>
          ),
          starred: (
            <Suspense fallback={<div>Loading...</div>}>
              <ProfileStarredPlugins userId={data?.id} />
            </Suspense>
          ),
        }}
      </ProfileTabs>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm text-muted-foreground">
        <span>Joined Cursor Directory</span>
        {format(new Date(data?.created_at), "MMM d, yyyy")}
      </div>
    </div>
  );
}
