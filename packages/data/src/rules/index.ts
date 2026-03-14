import { getPlugins } from "../plugins";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface Rule {
  title: string;
  slug: string;
  tags: string[];
  libs: string[];
  content: string;
  author?: {
    name: string;
    url: string | null;
    avatar: string | null;
  };
}

export type Section = {
  tag: string;
  slug: string;
  rules: Rule[];
};

export const rules: Rule[] = getPlugins()
  .flatMap((plugin) => plugin.rules)
  .map(
    (rule): Rule => ({
      title: rule.title,
      slug: rule.slug,
      tags: rule.tags,
      libs: rule.libs,
      content: rule.content,
      author: rule.author
        ? {
            name: rule.author.name,
            url: rule.author.url ?? null,
            avatar: rule.author.avatar ?? null,
          }
        : undefined,
    }),
  );

export function getSections(): Section[] {
  const categories = Array.from(new Set(rules.flatMap((rule) => rule.tags)));

  return categories
    .map((tag) => ({
      tag,
      rules: rules.filter((rule) => rule.tags.includes(tag)),
      slug: slugify(tag),
    }))
    .sort((a, b) => b.rules.length - a.rules.length);
}

export function getSectionBySlug(slug: string) {
  return getSections().find((section) => section.slug === slug);
}

export function getRuleBySlug(slug: string) {
  return rules.find(
    (rule) => rule.slug === slug || rule.slug === `official/${slug}`,
  );
}