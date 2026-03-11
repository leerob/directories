import { PluginDetail } from "@/components/plugins/plugin-detail";
import { getPluginBySlug, getPlugins } from "@directories/data/plugins";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPluginBySlug(slug);

  if (!plugin) {
    return {
      title: "Plugin Not Found",
    };
  }

  return {
    title: `${plugin.slug} | Cursor Directory`,
    description: plugin.description,
  };
}

export async function generateStaticParams() {
  return getPlugins().map((plugin) => ({
    slug: plugin.slug,
  }));
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const plugin = getPluginBySlug(slug);

  if (!plugin) {
    notFound();
  }

  return <PluginDetail plugin={plugin} />;
}

export const dynamic = "force-static";
export const revalidate = 86400;
