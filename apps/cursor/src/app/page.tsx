import type { PluginCardData } from "@/components/plugins/plugin-card";
import { Startpage } from "@/components/startpage";
import { getPublicCollections } from "@/data/collections";
import {
  getFeaturedJobs,
  getFeaturedPlugins,
  getForumPosts,
  getMembers,
  getPlugins,
  getPopularPosts,
  getTotalUsers,
} from "@/data/queries";
import { getEvents } from "@/lib/luma";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Cursor Directory - Explore What the Community Is Building",
  description:
    "Plugins, MCP servers, events, and thousands of developers building with Cursor.",
  openGraph: {
    title: "Cursor Directory - Explore What the Community Is Building",
    description:
      "Plugins, MCP servers, events, and thousands of developers building with Cursor.",
  },
  twitter: {
    title: "Cursor Directory - Explore What the Community Is Building",
    description:
      "Plugins, MCP servers, events, and thousands of developers building with Cursor.",
  },
};

export const dynamic = "force-static";
export const revalidate = 86400;

function getPluginType(components: { type: string }[]): "rules" | "mcp" | "both" {
  const hasRules = components.some((c) => c.type === "rule");
  const hasMcp = components.some((c) => c.type === "mcp_server");
  if (hasRules && hasMcp) return "both";
  if (hasMcp) return "mcp";
  return "rules";
}

function toPluginCard(p: NonNullable<Awaited<ReturnType<typeof getPlugins>>["data"]>[number]): PluginCardData {
  const components = p.plugin_components ?? [];
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    logo: p.logo,
    type: getPluginType(components),
    rulesCount: components.filter((c) => c.type === "rule").length,
    mcpCount: components.filter((c) => c.type === "mcp_server").length,
    keywords: p.keywords,
    installCount: p.install_count,
    href: `/plugins/${p.slug}`,
  };
}

export default async function Page() {
  const [
    { data: featuredJobs },
    { data: featuredPluginsData },
    { data: totalUsers },
    { data: members },
    { data: popularPosts },
    { data: allPluginsData },
    { entries: eventsData },
    { data: forumPosts },
    { data: collections },
  ] = await Promise.all([
    getFeaturedJobs({ onlyPremium: true }),
    getFeaturedPlugins({ onlyPremium: true }),
    getTotalUsers(),
    getMembers({ page: 1, limit: 12 }),
    getPopularPosts(),
    getPlugins({ fetchAll: true }),
    getEvents(),
    getForumPosts(),
    getPublicCollections({ limit: 4 }),
  ]);

  const featuredPlugins = (featuredPluginsData ?? []).slice(0, 8).map(toPluginCard);

  const allPlugins = (allPluginsData ?? [])
    .map(toPluginCard)
    .sort((a, b) => a.name.localeCompare(b.name));

  const popularPlugins = (allPluginsData ?? [])
    .filter((p) => p.install_count > 0)
    .sort((a, b) => b.install_count - a.install_count)
    .slice(0, 8)
    .map(toPluginCard);

  const recentPlugins = (allPluginsData ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 16)
    .map(toPluginCard);

  const now = new Date();
  const upcomingEvents = (eventsData ?? [])
    .filter(
      (e) =>
        e.event.visibility === "public" && new Date(e.event.end_at) >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.event.start_at).getTime() -
        new Date(b.event.start_at).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen w-full">
      <div className="w-full">
        <Suspense>
          <Startpage
            featuredPlugins={featuredPlugins}
            popularPlugins={popularPlugins}
            allPlugins={allPlugins}
            recentPlugins={recentPlugins}
            upcomingEvents={upcomingEvents}
            jobs={featuredJobs}
            totalUsers={totalUsers?.count ?? 0}
            members={members}
            popularPosts={popularPosts}
            forumPosts={forumPosts}
            collections={collections ?? []}
          />
        </Suspense>
      </div>
    </div>
  );
}
