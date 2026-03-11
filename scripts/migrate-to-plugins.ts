import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

type RuleAuthor = {
  name: string;
  url: string | null;
  avatar: string | null;
};

type RuleRecord = {
  title: string;
  slug: string;
  tags: string[];
  libs?: string[];
  content: string;
  author?: RuleAuthor;
};

type PluginRule = RuleRecord & {
  pluginSlug: string;
  source: string;
};

type PluginManifest = {
  name: string;
  version: string;
  description: string;
  author?: {
    name: string;
  };
  homepage?: string;
  keywords?: string[];
  logo?: string;
  rules?: string;
  mcpServers?: string;
};

type DatabaseMcp = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  link: string | null;
  mcp_link: string | null;
  owner_id: string | null;
  company_id: string | null;
  plan: string | null;
  active: boolean;
  order: number | null;
};

type StaticMcp = {
  name: string;
  url: string;
  description: string;
  logo?: string;
};

type PluginMcpSource = {
  pluginSlug: string;
  sourceKey: string;
  name: string;
  description: string;
  homepage?: string;
  logo?: string;
  deepLink?: string;
  provider: "database" | "static";
  rawConfig?: Record<string, unknown>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const rulesDir = path.join(rootDir, "packages/data/src/rules");
const officialDataDir = path.join(rootDir, "apps/cursor/src/data/official");
const pluginsDir = path.join(rootDir, "plugins");
const tempImportDir = path.join(rootDir, ".tmp-plugin-imports");

const RULE_CLUSTER_MAP = new Map<string, string>([
  ["nextjs", "nextjs"],
  ["nextjs-security-audit", "nextjs"],
  ["nextjsNewRules", "nextjs"],
  ["wordpress", "wordpress"],
  ["wordpress-woocommerce", "wordpress"],
  ["rails", "rails"],
  ["rails-api", "rails"],
  ["rspec", "rails"],
  ["web-scraping", "web-scraping"],
  ["large-scale-web-scraping", "web-scraping"],
  ["advanced-web-scraping", "web-scraping"],
  ["svelte", "svelte"],
  ["sveltekit", "svelte"],
  ["angular", "angular"],
  ["angular-ionic-firebase-firestore", "angular"],
  ["ionic", "angular"],
  ["technical-writer", "technical-writing"],
  ["technical-tutorials", "technical-writing"],
  ["c", "unity"],
  ["unity-c-sharp", "unity"],
  ["android", "android"],
  ["kotlin-jetpack", "android"],
  ["front-end", "frontend"],
  ["frontend-architecture", "frontend"],
  ["web-development", "frontend"],
  ["htmlandcss", "frontend"],
  ["tech-stack", "frontend"],
]);

const OFFICIAL_PLUGIN_MAP = new Map<string, string>([
  ["shadcn-ui", "shadcn-ui"],
  ["expo", "expo"],
  ["official/trpc", "trpc"],
  ["hono", "hono"],
  ["resend-typescript", "resend"],
  ["official/supabase-typescript", "supabase"],
  ["official/trigger-typescript", "trigger"],
  ["vercel-typescript", "vercel"],
  ["polar-typescript", "polar"],
  ["nuxt-typescript", "nuxtjs"],
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitleCase(value: string) {
  return value
    .split(/[-/]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function writeJson(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureDir(dirPath: string) {
  mkdirSync(dirPath, { recursive: true });
}

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseFrontmatter(input: string) {
  const trimmed = input.startsWith("\uFEFF") ? input.slice(1) : input;
  if (!trimmed.startsWith("---\n")) {
    return {
      data: {} as Record<string, unknown>,
      content: trimmed,
    };
  }

  const endIndex = trimmed.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return {
      data: {} as Record<string, unknown>,
      content: trimmed,
    };
  }

  const frontmatter = trimmed.slice(4, endIndex);
  const body = trimmed.slice(endIndex + 5);
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

    const listMatch = rawLine.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentArrayKey) {
      (data[currentArrayKey] as string[]).push(listMatch[1].trim());
      continue;
    }

    currentArrayKey = null;
    const lineMatch = rawLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!lineMatch) {
      continue;
    }

    const [, key, value] = lineMatch;
    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    data[key] = value.replace(/^['"]|['"]$/g, "");
  }

  return {
    data,
    content: body,
  };
}

async function importModule(modulePath: string) {
  return import(pathToFileURL(modulePath).href);
}

function sanitizeRuleSourceForImport(source: string) {
  let cursor = 0;
  let output = "";

  while (cursor < source.length) {
    const start = source.indexOf("content:", cursor);
    if (start === -1) {
      output += source.slice(cursor);
      break;
    }

    const backtickStart = source.indexOf("`", start);
    if (backtickStart === -1) {
      output += source.slice(cursor);
      break;
    }

    output += source.slice(cursor, backtickStart + 1);
    cursor = backtickStart + 1;

    while (cursor < source.length) {
      const char = source[cursor];
      if (char === "$" && source[cursor + 1] === "{") {
        output += "\\${";
        cursor += 2;
        continue;
      }

      if (char === "`") {
        const remainder = source.slice(cursor + 1);
        if (/^\s*,\s*(author:|\}|\])/.test(remainder)) {
          output += "`";
          cursor += 1;
          break;
        }

        output += "\\`";
        cursor += 1;
        continue;
      }

      output += char;
      cursor += 1;
    }
  }

  return output;
}

async function importRuleModule(modulePath: string, entryName: string) {
  try {
    return await importModule(modulePath);
  } catch {
    const source = readFileSync(modulePath, "utf8");
    ensureDir(tempImportDir);
    const sanitizedPath = path.join(
      tempImportDir,
      `${entryName.replace(/\.[^.]+$/, "")}.sanitized.ts`,
    );
    writeFileSync(sanitizedPath, sanitizeRuleSourceForImport(source), "utf8");
    return importModule(sanitizedPath);
  }
}

async function loadRuleModules() {
  const entries = readdirSync(rulesDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .filter((entry) => entry.name !== "index.ts")
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const sourceRules = new Map<string, PluginRule[]>();

  for (const entry of entries) {
    const modulePath = path.join(rulesDir, entry);
    const mod = await importRuleModule(modulePath, entry);
    const exportedRules = Object.values(mod).find(
      (value) =>
        Array.isArray(value) &&
        value.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.title === "string" &&
            typeof item.slug === "string" &&
            typeof item.content === "string",
        ),
    ) as RuleRecord[] | undefined;

    if (!exportedRules) {
      continue;
    }

    const baseName = entry.replace(/\.[^.]+$/, "");
    const pluginSlug = RULE_CLUSTER_MAP.get(baseName) ?? slugify(baseName);
    const mappedRules = exportedRules.map((rule) => ({
      ...rule,
      libs: rule.libs ?? [],
      content: `${rule.content}`.trim(),
      pluginSlug,
      source: `packages/data/src/rules/${entry}`,
    }));

    const currentRules = sourceRules.get(pluginSlug) ?? [];
    sourceRules.set(pluginSlug, [...currentRules, ...mappedRules]);
  }

  return sourceRules;
}

async function loadOfficialRules() {
  const cwd = process.cwd();
  process.chdir(path.join(rootDir, "apps/cursor"));

  const mod = await importModule(path.join(officialDataDir, "index.ts"));
  const officialRules = (mod.officialRules as RuleRecord[]).map((rule) => ({
    ...rule,
    libs: rule.libs ?? [],
    content: `${rule.content}`.trim(),
  }));

  process.chdir(cwd);

  const grouped = new Map<string, PluginRule[]>();

  for (const rule of officialRules) {
    const pluginSlug =
      OFFICIAL_PLUGIN_MAP.get(rule.slug) ??
      slugify(rule.slug.replace(/^official\//, ""));

    const currentRules = grouped.get(pluginSlug) ?? [];
    grouped.set(pluginSlug, [
      ...currentRules,
      {
        ...rule,
        pluginSlug,
        source: `apps/cursor/src/data/official/${rule.slug}`,
      },
    ]);
  }

  return grouped;
}

function parseJsonQueryValue(value: string) {
  const decoded = decodeURIComponent(value);
  try {
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function parseDeepLink(deepLink?: string | null) {
  if (!deepLink) {
    return undefined;
  }

  try {
    const url = new URL(deepLink);
    const params = url.searchParams;

    for (const key of ["config", "server", "settings", "data"]) {
      const value = params.get(key);
      if (!value) {
        continue;
      }

      const parsed = parseJsonQueryValue(value);
      if (parsed) {
        return parsed;
      }
    }

    const command = params.get("command");
    const args = params.getAll("args");
    const name = params.get("name");

    if (command || args.length > 0 || name) {
      return {
        name,
        command: command ?? undefined,
        args: args.length > 0 ? args : undefined,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

async function loadDatabaseMcps() {
  loadEnvFile(path.join(rootDir, ".env.local"));
  loadEnvFile(path.join(rootDir, "apps/cursor/.env.local"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error("Missing Supabase environment variables required for MCP export.");
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRole);
  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("active", true)
    .order("company_id", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as DatabaseMcp[];
}

async function loadStaticMcps() {
  const mod = await importModule(path.join(rootDir, "packages/data/src/mcp/index.ts"));
  return (mod.default ?? []) as StaticMcp[];
}

function buildPluginManifest(args: {
  name: string;
  description: string;
  keywords: string[];
  authorName?: string;
  logo?: string;
  homepage?: string;
  hasRules?: boolean;
  hasMcp?: boolean;
}) {
  const manifest: PluginManifest = {
    name: args.name,
    version: "1.0.0",
    description: args.description,
  };

  if (args.authorName) {
    manifest.author = {
      name: args.authorName,
    };
  }

  if (args.homepage) {
    manifest.homepage = args.homepage;
  }

  if (args.logo) {
    manifest.logo = args.logo;
  }

  if (args.keywords.length > 0) {
    manifest.keywords = args.keywords;
  }

  if (args.hasRules) {
    manifest.rules = "rules";
  }

  if (args.hasMcp) {
    manifest.mcpServers = ".mcp.json";
  }

  return manifest;
}

function renderRuleFile(rule: PluginRule) {
  const frontmatter = [
    "---",
    `title: ${rule.title.replace(/\n/g, " ").trim()}`,
    `slug: ${rule.slug}`,
    `description: ${rule.title.replace(/\n/g, " ").trim()}`,
    "alwaysApply: false",
    `source: ${rule.source}`,
  ];

  if (rule.tags.length > 0) {
    frontmatter.push("tags:");
    for (const tag of rule.tags) {
      frontmatter.push(`  - ${tag}`);
    }
  }

  if ((rule.libs ?? []).length > 0) {
    frontmatter.push("libs:");
    for (const lib of rule.libs ?? []) {
      frontmatter.push(`  - ${lib}`);
    }
  }

  if (rule.author?.name) {
    frontmatter.push(`authorName: ${rule.author.name}`);
  }

  if (rule.author?.url) {
    frontmatter.push(`authorUrl: ${rule.author.url}`);
  }

  if (rule.author?.avatar) {
    frontmatter.push(`authorAvatar: ${rule.author.avatar}`);
  }

  frontmatter.push("---", "", rule.content.trim(), "");

  return `${frontmatter.join("\n")}`;
}

function renderMcpConfig(mcp: PluginMcpSource) {
  const serverName = slugify(mcp.name);
  const parsed = mcp.rawConfig;

  if (parsed && typeof parsed === "object") {
    return {
      mcpServers: {
        [serverName]: parsed,
      },
      cursorDirectoryMetadata: {
        name: mcp.name,
        description: mcp.description,
        homepage: mcp.homepage,
        deepLink: mcp.deepLink,
        provider: mcp.provider,
      },
    };
  }

  return {
    mcpServers: {
      [serverName]: {
        description: mcp.description,
        installUrl: mcp.homepage,
        cursorDeepLink: mcp.deepLink,
      },
    },
    cursorDirectoryMetadata: {
      name: mcp.name,
      description: mcp.description,
      homepage: mcp.homepage,
      deepLink: mcp.deepLink,
      provider: mcp.provider,
    },
  };
}

function mergeRuleGroups(...groups: Map<string, PluginRule[]>[]) {
  const merged = new Map<string, PluginRule[]>();

  for (const group of groups) {
    for (const [pluginSlug, rules] of group) {
      const current = merged.get(pluginSlug) ?? [];
      merged.set(pluginSlug, [...current, ...rules]);
    }
  }

  return merged;
}

function buildPluginDirs(ruleGroups: Map<string, PluginRule[]>, mcpSources: PluginMcpSource[]) {
  const pluginNames = new Set<string>();
  const marketplaceEntries: Array<{
    name: string;
    source: string;
    description: string;
    keywords?: string[];
    logo?: string;
    homepage?: string;
  }> = [];

  const mcpByPlugin = new Map<string, PluginMcpSource>();
  for (const mcp of mcpSources) {
    mcpByPlugin.set(mcp.pluginSlug, mcp);
  }

  const allPluginSlugs = unique([
    ...Array.from(ruleGroups.keys()),
    ...mcpSources.map((mcp) => mcp.pluginSlug),
  ]).sort((a, b) => a.localeCompare(b));

  rmSync(pluginsDir, { recursive: true, force: true });
  ensureDir(path.join(pluginsDir, ".cursor-plugin"));

  for (const pluginSlug of allPluginSlugs) {
    pluginNames.add(pluginSlug);
    const pluginPath = path.join(pluginsDir, pluginSlug);
    const manifestPath = path.join(pluginPath, ".cursor-plugin", "plugin.json");
    const rules = (ruleGroups.get(pluginSlug) ?? []).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
    const mcp = mcpByPlugin.get(pluginSlug);

    ensureDir(path.join(pluginPath, ".cursor-plugin"));

    if (rules.length > 0) {
      ensureDir(path.join(pluginPath, "rules"));
      for (const rule of rules) {
        const ruleFilePath = path.join(
          pluginPath,
          "rules",
          `${slugify(rule.slug.replace(/^official\//, ""))}.mdc`,
        );
        writeFileSync(ruleFilePath, renderRuleFile(rule), "utf8");
      }
    }

    if (mcp) {
      writeJson(path.join(pluginPath, ".mcp.json"), renderMcpConfig(mcp));
    }

    const keywords = unique([
      ...rules.flatMap((rule) => [...rule.tags, ...(rule.libs ?? [])]),
      ...(mcp ? ["mcp"] : []),
    ]).sort((a, b) => a.localeCompare(b));

    const authorName =
      rules.find((rule) => rule.author?.name)?.author?.name ??
      (mcp ? `${mcp.name} MCP` : undefined);

    const manifest = buildPluginManifest({
      name: pluginSlug,
      description:
        rules[0]?.title ??
        mcp?.description ??
        `Community plugin for ${toTitleCase(pluginSlug)}`,
      authorName,
      keywords,
      logo: mcp?.logo,
      homepage: mcp?.homepage,
      hasRules: rules.length > 0,
      hasMcp: Boolean(mcp),
    });

    writeJson(manifestPath, manifest);

    marketplaceEntries.push({
      name: pluginSlug,
      source: pluginSlug,
      description: manifest.description,
      keywords: manifest.keywords,
      logo: manifest.logo,
      homepage: manifest.homepage,
    });
  }

  writeJson(path.join(pluginsDir, ".cursor-plugin", "marketplace.json"), {
    name: "cursor-directory",
    owner: {
      name: "Cursor Directory",
    },
    metadata: {
      description: "Community plugins for Cursor from cursor.directory",
    },
    plugins: marketplaceEntries,
  });

  return pluginNames.size;
}

function dedupeMcps(databaseMcps: DatabaseMcp[], staticMcps: StaticMcp[]) {
  const seen = new Map<string, PluginMcpSource>();

  for (const mcp of databaseMcps) {
    const normalizedSlug = slugify(mcp.slug || mcp.name);
    const sourceKey = normalizedSlug || slugify(mcp.name);
    seen.set(sourceKey, {
      pluginSlug: `mcp-${sourceKey}`,
      sourceKey,
      name: mcp.name,
      description: mcp.description,
      logo: mcp.logo ?? undefined,
      homepage: mcp.link ?? undefined,
      deepLink: mcp.mcp_link ?? undefined,
      provider: "database",
      rawConfig: parseDeepLink(mcp.mcp_link),
    });
  }

  for (const mcp of staticMcps) {
    const sourceKey = slugify(mcp.name);
    if (seen.has(sourceKey)) {
      continue;
    }

    seen.set(sourceKey, {
      pluginSlug: `mcp-${sourceKey}`,
      sourceKey,
      name: mcp.name,
      description: mcp.description,
      logo: mcp.logo,
      homepage: mcp.url,
      provider: "static",
    });
  }

  return Array.from(seen.values()).sort((a, b) => a.pluginSlug.localeCompare(b.pluginSlug));
}

async function main() {
  const remainingRuleSources = readdirSync(rulesDir, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith(".") && entry.name !== "index.ts",
  );
  const hasOfficialSources = existsSync(path.join(officialDataDir, "index.ts"));

  if (remainingRuleSources.length === 0 && !hasOfficialSources && existsSync(pluginsDir)) {
    console.log(
      "Legacy rule sources have already been removed. Keeping the existing plugins directory as the source of truth.",
    );
    return;
  }

  const [ruleGroups, officialGroups, databaseMcps, staticMcps] = await Promise.all([
    loadRuleModules(),
    loadOfficialRules(),
    loadDatabaseMcps(),
    loadStaticMcps(),
  ]);

  const mergedRules = mergeRuleGroups(ruleGroups, officialGroups);
  const mcpSources = dedupeMcps(databaseMcps, staticMcps);
  const pluginCount = buildPluginDirs(mergedRules, mcpSources);

  console.log(
    `Generated ${pluginCount} plugins (${mergedRules.size} rule plugins, ${mcpSources.length} MCP plugins).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
