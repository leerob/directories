import { getPluginByLegacyRuleSlug, getPlugins } from "@directories/data/plugins";
import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

export const revalidate = 86400; // Revalidate every 24 hours (86400 seconds)

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const plugin = getPluginByLegacyRuleSlug(slug);

  return {
    title: plugin ? `${plugin.slug} | Cursor Directory` : "Plugin not found",
    description: plugin?.description,
  };
}

export async function generateStaticParams() {
  return getPlugins()
    .flatMap((plugin) => plugin.rules)
    .filter((rule) => rule.slug.startsWith("official/"))
    .map((rule) => ({
      slug: rule.slug.replace(/^official\//, ""),
    }));
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const plugin = getPluginByLegacyRuleSlug(slug);
  if (plugin) {
    redirect(`/plugins/${plugin.slug}`);
  }

  return <div>Plugin not found</div>;
}
