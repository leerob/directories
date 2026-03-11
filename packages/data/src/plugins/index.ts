import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type PluginAuthor = {
  name: string;
  url?: string | null;
  avatar?: string | null;
  email?: string | null;
};

export type PluginRule = {
  title: string;
  slug: string;
  description: string;
  content: string;
  alwaysApply: boolean;
  globs: string[];
  tags: string[];
  libs: string[];
  source?: string;
  author?: PluginAuthor;
};

export type PluginMcpServer = {
  key: string;
  config: Record<string, unknown>;
  metadata?: {
    name?: string;
    description?: string;
    homepage?: string;
    deepLink?: string;
    provider?: string;
  };
};

export type Plugin = {
  name: string;
  slug: string;
  description: string;
  version?: string;
  author?: PluginAuthor;
  keywords: string[];
  logo?: string;
  homepage?: string;
  rules: PluginRule[];
  mcpServers: PluginMcpServer[];
  hasMcp: boolean;
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

function resolvePluginsRoot() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(currentDir, "../../../../plugins"),
    path.resolve(process.cwd(), "plugins"),
    path.resolve(process.cwd(), "../../plugins"),
    path.resolve(process.cwd(), "../plugins"),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Unable to locate generated plugins directory.");
  }

  return found;
}

function parseFrontmatter(input: string) {
  const content = input.startsWith("\uFEFF") ? input.slice(1) : input;
  if (!content.startsWith("---\n")) {
    return {
      data: {} as Record<string, unknown>,
      body: content,
    };
  }

  const endIndex = content.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return {
      data: {} as Record<string, unknown>,
      body: content,
    };
  }

  const frontmatter = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5);
  const data: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;

  for (const rawLine of frontmatter.split(/\r?\n/)) {
    if (!rawLine.trim()) {
      continue;
    }

    const arrayMatch = rawLine.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (arrayMatch) {
      currentArrayKey = arrayMatch[1];
      data[currentArrayKey] = [];
      continue;
    }

    const itemMatch = rawLine.match(/^\s*-\s+(.*)$/);
    if (itemMatch && currentArrayKey) {
      (data[currentArrayKey] as string[]).push(itemMatch[1].trim());
      continue;
    }

    currentArrayKey = null;
    const match = rawLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (rawValue === "true" || rawValue === "false") {
      data[key] = rawValue === "true";
      continue;
    }

    data[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }

  return {
    data,
    body,
  };
}

function parseRuleFile(filePath: string): PluginRule {
  const raw = readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(raw);

  return {
    title: String(data.title ?? data.description ?? path.basename(filePath, ".mdc")),
    slug: String(data.slug ?? slugify(path.basename(filePath, ".mdc"))),
    description: String(data.description ?? data.title ?? ""),
    content: body.trim(),
    alwaysApply: Boolean(data.alwaysApply),
    globs: Array.isArray(data.globs) ? (data.globs as string[]) : [],
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    libs: Array.isArray(data.libs) ? (data.libs as string[]) : [],
    source: typeof data.source === "string" ? data.source : undefined,
    author:
      typeof data.authorName === "string"
        ? {
            name: data.authorName,
            url: typeof data.authorUrl === "string" ? data.authorUrl : null,
            avatar:
              typeof data.authorAvatar === "string" ? data.authorAvatar : null,
          }
        : undefined,
  };
}

function parseManifest(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf8")) as {
    name: string;
    description: string;
    version?: string;
    author?: {
      name: string;
      email?: string;
    };
    homepage?: string;
    keywords?: string[];
    logo?: string;
  };
}

function parseMcpConfig(filePath: string) {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
    mcpServers?: Record<string, Record<string, unknown>>;
    cursorDirectoryMetadata?: Record<string, unknown>;
  };

  const metadata = parsed.cursorDirectoryMetadata as
    | PluginMcpServer["metadata"]
    | undefined;

  return Object.entries(parsed.mcpServers ?? {}).map(([key, config]) => ({
    key,
    config,
    metadata,
  }));
}

function loadPlugins(): Plugin[] {
  if (cachedPlugins) {
    return cachedPlugins;
  }

  const pluginsRoot = resolvePluginsRoot();
  const pluginDirs = readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const loadedPlugins: Plugin[] = [];

  for (const pluginDir of pluginDirs) {
    const pluginPath = path.join(pluginsRoot, pluginDir);
    const manifestPath = path.join(pluginPath, ".cursor-plugin", "plugin.json");
    if (!existsSync(manifestPath)) {
      continue;
    }

    const manifest = parseManifest(manifestPath);
    const rulesDir = path.join(pluginPath, "rules");
    const mcpPath = path.join(pluginPath, ".mcp.json");

    const rules = existsSync(rulesDir)
      ? readdirSync(rulesDir)
          .filter((fileName) => fileName.endsWith(".mdc"))
          .sort((a, b) => a.localeCompare(b))
          .map((fileName) => parseRuleFile(path.join(rulesDir, fileName)))
      : [];

    const mcpServers = existsSync(mcpPath) ? parseMcpConfig(mcpPath) : [];

    const fallbackAuthor: PluginAuthor | undefined = manifest.author?.name
      ? {
          name: manifest.author.name,
          email: manifest.author.email ?? null,
        }
      : undefined;

    loadedPlugins.push({
      name: manifest.name,
      slug: manifest.name,
      description: manifest.description,
      version: manifest.version,
      author: rules[0]?.author ?? fallbackAuthor,
      keywords: manifest.keywords ?? [],
      logo: manifest.logo,
      homepage: manifest.homepage,
      rules,
      mcpServers,
      hasMcp: mcpServers.length > 0,
    });
  }

  cachedPlugins = loadedPlugins.sort((a, b) => a.slug.localeCompare(b.slug));

  return cachedPlugins;
}

export function getPlugins() {
  return loadPlugins();
}

export function getPluginBySlug(slug: string) {
  return loadPlugins().find((plugin) => plugin.slug === slug);
}

export function getPluginByLegacyRuleSlug(ruleSlug: string) {
  return loadPlugins().find((plugin) =>
    plugin.rules.some((rule) => rule.slug === ruleSlug || rule.slug === `official/${ruleSlug}`),
  );
}

export function getPluginByLegacyMcpSlug(slug: string) {
  return getPluginBySlug(`mcp-${slug}`);
}

export function getPluginSections() {
  const plugins = loadPlugins();
  const keywords = unique(
    plugins.flatMap((plugin) => plugin.keywords).filter((keyword) => keyword !== "mcp"),
  ).sort((a, b) => a.localeCompare(b));

  const sections: PluginSection[] = keywords.map((keyword) => ({
    tag: keyword,
    slug: slugify(keyword),
    plugins: plugins
      .filter((plugin) => plugin.keywords.includes(keyword))
      .sort((a, b) => a.slug.localeCompare(b.slug)),
  }));

  const mcpPlugins = plugins.filter((plugin) => plugin.hasMcp);
  if (mcpPlugins.length > 0) {
    sections.unshift({
      tag: "MCP",
      slug: "mcp",
      plugins: mcpPlugins.sort((a, b) => a.slug.localeCompare(b.slug)),
    });
  }

  return sections
    .filter((section) => section.plugins.length > 0)
    .sort((a, b) => b.plugins.length - a.plugins.length);
}

export function getFeaturedPlugins(limit = 4) {
  const plugins = loadPlugins();
  const featuredSlugs = ["nextjs", "frontend", "rails", "web-scraping"];

  const curated = featuredSlugs
    .map((slug) => plugins.find((plugin) => plugin.slug === slug))
    .filter((plugin): plugin is Plugin => Boolean(plugin));

  const fallbacks = plugins
    .filter((plugin) => !featuredSlugs.includes(plugin.slug))
    .sort((a, b) => {
      if (a.hasMcp !== b.hasMcp) {
        return a.hasMcp ? -1 : 1;
      }

      return b.rules.length - a.rules.length;
    });

  return [...curated, ...fallbacks].slice(0, limit);
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}
