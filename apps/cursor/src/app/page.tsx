import { Startpage } from "@/components/startpage";
import {
  getFeaturedJobs,
  getMembers,
  getPopularPosts,
  getTotalUsers,
} from "@/data/queries";
import { getFeaturedPlugins, getPlugins } from "@directories/data/plugins";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cursor Directory - Community Plugins",
  description:
    "Browse community plugins for Cursor, including reusable rules and MCP servers.",
};

// Add force-static and revalidate configuration
export const dynamic = "force-static";
export const revalidate = 86400; // Revalidate once every day

export default async function Page() {
  const featuredPlugins = getFeaturedPlugins(4);
  const plugins = getPlugins();
  const { data: featuredJobs } = await getFeaturedJobs({
    onlyPremium: true,
  });

  const { data: totalUsers } = await getTotalUsers();

  const { data: members } = await getMembers({
    page: 1,
    limit: 12,
  });

  const { data: popularPosts } = await getPopularPosts();

  return (
    <div className="flex justify-center min-h-screen w-full md:px-0 px-6 mt-[10%]">
      <div className="w-full max-w-6xl">
        <Startpage
          featuredPlugins={featuredPlugins}
          plugins={plugins}
          jobs={featuredJobs}
          totalUsers={totalUsers?.count ?? 0}
          members={members}
          popularPosts={popularPosts}
        />
      </div>
    </div>
  );
}
