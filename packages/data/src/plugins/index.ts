import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type PluginAuthor = {
  name: string;
  url?: string | null;
  avatar?: string | null;
};

export type PluginRule = {
  title: string;
  slug: string;
  tags: string[];
  libs: string[];
  content: string;
  author?: PluginAuthor;
};

export type Plugin = {
  name: string;
  slug: string;
  description: string;
  keywords: string[];
  logo?: string;
  homepage?: string;
  author?: PluginAuthor;
  rules: PluginRule[];
};

export type PluginSection = {
  tag: string;
  slug: string;
  plugins: Plugin[];
};

let cachedPlugins: Plugin[] | null = null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolvePluginsRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), "../../plugins"),
    path.resolve(process.cwd(), "../plugins"),
    path.resolve(process.cwd(), "plugins"),
  ];

  const found = candidates.find((c) => existsSync(c));
  if (!found) {
    console.warn("Could not locate plugins directory, returning empty list");
    return "";
  }
  return found;
}

function parseFrontmatter(input: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const content = input.startsWith("\uFEFF") ? input.slice(1) : input;
  if (!content.startsWith("---\n")) {
    return { data: {}, body: content };
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { data: {}, body: content };
  }

  const frontmatter = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5);
  const data: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;
  let currentObjectKey: string | null = null;
  const currentObject: Record<string, unknown> = {};

  for (const rawLine of frontmatter.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;

    if (currentObjectKey) {
      const subMatch = rawLine.match(/^\s{2,}(\w+):\s*(.+)$/);
      if (subMatch) {
        currentObject[subMatch[1]] = subMatch[2].replace(/^["']|["']$/g, "");
        continue;
      }
      data[currentObjectKey] = { ...currentObject };
      currentObjectKey = null;
      for (const k of Object.keys(currentObject)) delete currentObject[k];
    }

    const arrayKeyMatch = rawLine.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*$/);
    if (arrayKeyMatch) {
      const key = arrayKeyMatch[1];
      if (currentArrayKey && Array.isArray(data[currentArrayKey])) {
        // previous array is done
      }
      currentArrayKey = key;
      data[currentArrayKey] = [];
      continue;
    }

    if (currentArrayKey && rawLine.match(/^\s+-\s+/)) {
      const value = rawLine.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      (data[currentArrayKey] as string[]).push(value);
      continue;
    }

    const kvMatch = rawLine.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s+(.+)$/);
    if (kvMatch) {
      currentArrayKey = null;
      const value = kvMatch[2].replace(/^["']|["']$/g, "");
      data[kvMatch[1]] = value;
      continue;
    }

    const objectKeyMatch = rawLine.match(
      /^([A-Za-z_][A-Za-z0-9_-]*):\s*$/,
    );
    if (objectKeyMatch && !currentArrayKey) {
      currentObjectKey = objectKeyMatch[1];
      continue;
    }
  }

  if (currentObjectKey) {
    data[currentObjectKey] = { ...currentObject };
  }

  return { data, body };
}

function loadPlugins(): Plugin[] {
  const root = resolvePluginsRoot();
  if (!root) return [];

  const entries = readdirSync(root, { withFileTypes: true });
  const plugins: Plugin[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(root, entry.name);
    const metaPath = path.join(pluginDir, ".cursor-plugin", "plugin.json");

    if (!existsSync(metaPath)) continue;

    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      const rulesDir = path.join(pluginDir, "rules");
      const rules: PluginRule[] = [];

      if (existsSync(rulesDir)) {
        for (const file of readdirSync(rulesDir)) {
          if (!file.endsWith(".mdc")) continue;

          const raw = readFileSync(path.join(rulesDir, file), "utf-8");
          const { data, body } = parseFrontmatter(raw);

          rules.push({
            title: (data.title as string) || file.replace(".mdc", ""),
            slug: (data.slug as string) || slugify(file.replace(".mdc", "")),
            tags: (data.tags as string[]) || [],
            libs: (data.libs as string[]) || [],
            content: body.trim(),
            author: data.author
              ? {
                  name: (data.author as Record<string, string>).name,
                  url: (data.author as Record<string, string>).url || null,
                  avatar:
                    (data.author as Record<string, string>).avatar || null,
                }
              : undefined,
          });
        }
      }

      plugins.push({
        name: meta.name || entry.name,
        slug: entry.name,
        description:
          meta.description || `${meta.name || entry.name} plugin for Cursor`,
        keywords: meta.keywords || [],
        logo: meta.logo,
        homepage: meta.homepage,
        author: meta.author,
        rules,
      });
    } catch (err) {
      console.warn(`Failed to load plugin ${entry.name}:`, err);
    }
  }

  return plugins.sort((a, b) => a.name.localeCompare(b.name));
}

export function getPlugins(): Plugin[] {
  if (!cachedPlugins) {
    cachedPlugins = loadPlugins();
  }
  return cachedPlugins;
}

export function getPluginBySlug(slug: string): Plugin | undefined {
  return getPlugins().find((p) => p.slug === slug);
}

export function getPluginSections(): PluginSection[] {
  const plugins = getPlugins();
  const tagMap = new Map<string, Plugin[]>();

  for (const plugin of plugins) {
    for (const keyword of plugin.keywords) {
      const existing = tagMap.get(keyword) || [];
      if (!existing.includes(plugin)) {
        existing.push(plugin);
      }
      tagMap.set(keyword, existing);
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, tagPlugins]) => ({
      tag,
      slug: slugify(tag),
      plugins: tagPlugins,
    }))
    .sort((a, b) => b.plugins.length - a.plugins.length);
}
