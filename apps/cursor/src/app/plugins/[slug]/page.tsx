import { PluginDetailView } from "@/components/plugins/plugin-detail";
import { getPluginBySlug, getPlugins, getMCPBySlug } from "@/data/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: plugin } = await getPluginBySlug(slug);
  if (plugin?.active) {
    const title = `${plugin.name} | Cursor Directory`;
    const description = plugin.description ?? undefined;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
    };
  }

  if (plugin && !plugin.active) {
    return {
      title: `${plugin.name} | Cursor Directory`,
      robots: { index: false },
    };
  }

  return { title: "Plugin Not Found" };
}

export async function generateStaticParams() {
  const { data: plugins } = await getPlugins({ fetchAll: true });
  return (plugins ?? []).map((p) => ({ slug: p.slug }));
}

async function enrichLegacyMcpComponents(
  plugin: NonNullable<Awaited<ReturnType<typeof getPluginBySlug>>["data"]>,
) {
  const components = plugin.plugin_components;
  if (!components?.length) return plugin;

  const enriched = await Promise.all(
    components.map(async (comp) => {
      if (comp.type !== "mcp_server") return comp;

      const meta = comp.metadata as Record<string, unknown>;
      if (comp.content || meta?.mcp_link || meta?.config) return comp;

      const legacySlug = meta?.legacy_slug as string | undefined;
      if (!legacySlug) return comp;

      const { data: legacyMcp } = await getMCPBySlug(legacySlug);
      if (!legacyMcp) return comp;

      const legacyConfig = legacyMcp.config as Record<string, unknown> | null;
      const legacyLink = legacyMcp.link as string | null;

      const newMeta = { ...meta };
      if (legacyConfig) newMeta.config = legacyConfig;
      if (legacyLink && !meta.link) newMeta.link = legacyLink;

      return { ...comp, metadata: newMeta };
    }),
  );

  return { ...plugin, plugin_components: enriched };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  const { data: plugin } = await getPluginBySlug(slug);
  if (!plugin) notFound();

  const enrichedPlugin = await enrichLegacyMcpComponents(plugin);

  return <PluginDetailView plugin={enrichedPlugin} />;
}

export const revalidate = 3600;
