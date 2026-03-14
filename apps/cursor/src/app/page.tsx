import type { PluginCardData } from "@/components/plugins/plugin-card";
import { Startpage } from "@/components/startpage";
import {
  getFeaturedJobs,
  getFeaturedMCPs,
  getMCPs,
  getMembers,
  getPopularPosts,
  getRecentMCPs,
  getTotalUsers,
} from "@/data/queries";
import { getPlugins } from "@directories/data/plugins";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cursor Directory - Plugins, Rules & MCP Servers",
  description:
    "Enhance your Cursor with plugins, custom rules, MCP servers, and join a community of Cursor enthusiasts.",
};

export const dynamic = "force-static";
export const revalidate = 86400;

export default async function Page() {
  const { data: featuredJobs } = await getFeaturedJobs({
    onlyPremium: true,
  });

  const { data: featuredMCPs } = await getFeaturedMCPs({
    onlyPremium: true,
  });

  const { data: totalUsers } = await getTotalUsers();

  const { data: members } = await getMembers({
    page: 1,
    limit: 12,
  });

  const { data: popularPosts } = await getPopularPosts();

  const filePlugins = getPlugins();
  const topRulePlugins: PluginCardData[] = filePlugins
    .filter((p) => p.rules.length > 0)
    .slice(0, 4)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      logo: p.logo,
      type: "rules" as const,
      rulesCount: p.rules.length,
      href: `/plugins/${p.slug}`,
    }));

  const topMCPPlugins: PluginCardData[] = (featuredMCPs ?? [])
    .slice(0, 4)
    .map((mcp) => ({
      name: mcp.name,
      slug: `mcp-${mcp.slug}`,
      description: mcp.description,
      logo: mcp.logo,
      type: "mcp" as const,
      href: `/plugins/mcp-${mcp.slug}`,
    }));

  const featuredPlugins = [...topMCPPlugins, ...topRulePlugins];

  const { data: allMCPs } = await getMCPs({ fetchAll: true });

  const allRulePlugins: PluginCardData[] = filePlugins
    .filter((p) => p.rules.length > 0)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      logo: p.logo,
      type: "rules" as const,
      rulesCount: p.rules.length,
      keywords: p.keywords,
      href: `/plugins/${p.slug}`,
    }));

  const allMCPPlugins: PluginCardData[] = (allMCPs ?? []).map((mcp) => ({
    name: mcp.name,
    slug: `mcp-${mcp.slug}`,
    description: mcp.description,
    logo: mcp.logo,
    type: "mcp" as const,
    href: `/plugins/mcp-${mcp.slug}`,
  }));

  const seen = new Set<string>();
  const allPlugins = [...allRulePlugins, ...allMCPPlugins]
    .filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const { data: recentMCPData } = await getRecentMCPs({ limit: 8 });
  const recentMCPPlugins: PluginCardData[] = (recentMCPData ?? []).map(
    (mcp) => ({
      name: mcp.name,
      slug: `mcp-${mcp.slug}`,
      description: mcp.description,
      logo: mcp.logo,
      type: "mcp" as const,
      href: `/plugins/mcp-${mcp.slug}`,
    }),
  );

  const shuffledRulePlugins = [...allRulePlugins]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const recentPlugins = [...recentMCPPlugins, ...shuffledRulePlugins];

  return (
    <div className="flex justify-center min-h-screen w-full md:px-0 px-6 mt-[10%]">
      <div className="w-full max-w-6xl">
        <Suspense>
          <Startpage
            featuredPlugins={featuredPlugins}
            allPlugins={allPlugins}
            recentPlugins={recentPlugins}
            jobs={featuredJobs}
            totalUsers={totalUsers?.count ?? 0}
            members={members}
            popularPosts={popularPosts}
          />
        </Suspense>
      </div>
    </div>
  );
}
