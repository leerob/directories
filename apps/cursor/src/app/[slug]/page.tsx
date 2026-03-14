import { getPlugins } from "@directories/data/plugins";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const plugins = getPlugins();
  return plugins.flatMap((plugin) =>
    plugin.rules.map((rule) => ({ slug: rule.slug })),
  );
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  const plugins = getPlugins();
  const parentPlugin = plugins.find((p) =>
    p.rules.some((r) => r.slug === slug),
  );

  if (parentPlugin) {
    redirect(`/plugins/${parentPlugin.slug}`);
  }

  notFound();
}
