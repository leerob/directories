import { getRuleBySlug, rules } from "@directories/data/rules";
import { getPluginByLegacyRuleSlug } from "@directories/data/plugins";
import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const rule = getRuleBySlug(slug);

  return {
    title: `${rule?.title} rule by ${rule?.author?.name}`,
    description: rule?.content,
  };
}

export async function generateStaticParams() {
  return rules.map((rule) => ({
    slug: rule.slug,
  }));
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const plugin = getPluginByLegacyRuleSlug(slug);
  if (plugin) {
    redirect(`/plugins/${plugin.slug}`);
  }

  return <div>Rule not found</div>;
}

export const revalidate = 86400; // Revalidate every 24 hours (86400 seconds)
