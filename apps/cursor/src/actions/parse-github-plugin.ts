"use server";

import { z } from "zod";
import { ActionError } from "./safe-action";
import { authActionClient } from "./safe-action";

type ParsedComponent = {
  type: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  metadata: Record<string, unknown>;
};

type ParsedPlugin = {
  name: string;
  description: string;
  version?: string;
  logo?: string;
  homepage?: string;
  repository: string;
  license?: string;
  keywords: string[];
  author_name?: string;
  author_url?: string;
  author_avatar?: string;
  components: ParsedComponent[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontmatter(input: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const content = input.startsWith("\uFEFF") ? input.slice(1) : input;
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n")) {
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

    if (currentArrayKey && rawLine.match(/^\s+-\s+/)) {
      const value = rawLine.replace(/^\s+-\s+/, "").replace(/^["']|["']$/g, "");
      (data[currentArrayKey] as string[]).push(value);
      continue;
    }

    const arrayKeyMatch = rawLine.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*$/);
    if (arrayKeyMatch) {
      currentArrayKey = arrayKeyMatch[1];
      data[currentArrayKey] = [];
      continue;
    }

    const kvMatch = rawLine.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s+(.+)$/);
    if (kvMatch) {
      currentArrayKey = null;
      data[kvMatch[1]] = kvMatch[2].replace(/^["']|["']$/g, "");
      continue;
    }

    const objectKeyMatch = rawLine.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*$/);
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

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/,
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function fetchGitHubFile(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

async function fetchGitHubTree(
  owner: string,
  repo: string,
): Promise<{ path: string; type: string }[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.tree ?? []).map((t: { path: string; type: string }) => ({
      path: t.path,
      type: t.type,
    }));
  } catch {
    return [];
  }
}

export const parseGitHubPluginAction = authActionClient
  .metadata({ actionName: "parse-github-plugin" })
  .inputSchema(
    z.object({
      url: z.url({ error: "Please enter a valid GitHub URL" }),
    }),
  )
  .action(async ({ parsedInput: { url } }) => {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      throw new ActionError(
        "Invalid GitHub URL. Expected format: https://github.com/owner/repo",
      );
    }

    const { owner, repo } = parsed;

    const tree = await fetchGitHubTree(owner, repo);
    if (tree.length === 0) {
      throw new ActionError(
        "Could not read repository. Make sure the repo exists, is public, and the URL is correct.",
      );
    }

    // Look for manifest — check root-level, then per-plugin directories
    const rootManifestPaths = [
      ".plugin/plugin.json",
      ".cursor-plugin/plugin.json",
      ".claude-plugin/plugin.json",
      ".cursor-plugin/marketplace.json",
    ];
    let manifest: Record<string, unknown> = {};
    for (const mp of rootManifestPaths) {
      const content = await fetchGitHubFile(owner, repo, mp);
      if (content) {
        try {
          manifest = JSON.parse(content);
        } catch {
          // ignore invalid JSON
        }
        break;
      }
    }

    // For multi-plugin repos, try reading the first plugin's manifest for metadata
    if (!manifest.name) {
      const pluginManifestFiles = tree.filter(
        (f) =>
          f.type === "blob" &&
          /^plugins\/[^/]+\/.cursor-plugin\/plugin\.json$/.test(f.path),
      );
      for (const pmf of pluginManifestFiles) {
        const content = await fetchGitHubFile(owner, repo, pmf.path);
        if (!content) continue;
        try {
          const parsed = JSON.parse(content);
          if (!manifest.name && parsed.name) manifest.name = parsed.name;
          if (!manifest.description && parsed.description)
            manifest.description = parsed.description;
          if (!manifest.version && parsed.version)
            manifest.version = parsed.version;
          if (!manifest.author && parsed.author)
            manifest.author = parsed.author;
          if (!manifest.keywords && parsed.keywords)
            manifest.keywords = parsed.keywords;
          if (!manifest.license && parsed.license)
            manifest.license = parsed.license;
          break;
        } catch {
          // ignore
        }
      }
    }

    const components: ParsedComponent[] = [];

    // Determine root prefix(es) — support multi-plugin repos (plugins/*/)
    const prefixes = [""];
    const pluginDirs = tree
      .filter(
        (f) =>
          f.type === "blob" &&
          /^plugins\/[^/]+\/.cursor-plugin\/plugin\.json$/.test(f.path),
      )
      .map((f) => f.path.replace("/.cursor-plugin/plugin.json", "") + "/");
    if (pluginDirs.length > 0) prefixes.push(...pluginDirs);

    for (const prefix of prefixes) {
      // Discover rules (rules/*.mdc)
      const ruleFiles = tree.filter(
        (f) =>
          f.type === "blob" &&
          new RegExp(`^${prefix}rules/.*\\.mdc$`).test(f.path),
      );
      for (const rf of ruleFiles) {
        const raw = await fetchGitHubFile(owner, repo, rf.path);
        if (!raw) continue;
        const { data, body } = parseFrontmatter(raw);
        const filename = rf.path.split("/").pop()?.replace(".mdc", "") ?? "";

        components.push({
          type: "rule",
          name:
            (data.title as string) ||
            (data.description as string) ||
            filename,
          slug: slugify(filename),
          description:
            (data.description as string) || body.trim().slice(0, 200),
          content: body.trim(),
          metadata: {
            tags: (data.tags as string[]) ?? [],
            libs: (data.libs as string[]) ?? [],
            ...(data.globs ? { globs: data.globs } : {}),
            ...(data.alwaysApply === true || data.alwaysApply === "true"
              ? { always_apply: true }
              : {}),
            ...(data.author
              ? {
                  author_name: (data.author as Record<string, string>).name,
                  author_url: (data.author as Record<string, string>).url,
                  author_avatar: (data.author as Record<string, string>)
                    .avatar,
                }
              : {}),
          },
        });
      }

      // Discover MCP servers (.mcp.json or mcp.json)
      for (const mcpPath of [`${prefix}.mcp.json`, `${prefix}mcp.json`]) {
        const mcpContent = await fetchGitHubFile(owner, repo, mcpPath);
        if (!mcpContent) continue;
        try {
          const mcpConfig = JSON.parse(mcpContent);
          const servers = mcpConfig.mcpServers ?? mcpConfig;
          for (const [name, config] of Object.entries(servers)) {
            const cfg = config as Record<string, unknown>;
            components.push({
              type: "mcp_server",
              name,
              slug: slugify(name),
              description: `MCP server: ${name}`,
              content: JSON.stringify(cfg, null, 2),
              metadata: {
                command: cfg.command,
                args: cfg.args,
                env: cfg.env,
                link: `https://github.com/${owner}/${repo}`,
              },
            });
          }
        } catch {
          // ignore
        }
      }

      // Discover agents (agents/*.md)
      const agentFiles = tree.filter(
        (f) =>
          f.type === "blob" &&
          new RegExp(`^${prefix}agents/.*\\.md$`).test(f.path),
      );
      for (const af of agentFiles) {
        const raw = await fetchGitHubFile(owner, repo, af.path);
        if (!raw) continue;
        const { data, body } = parseFrontmatter(raw);
        const filename = af.path.split("/").pop()?.replace(".md", "") ?? "";

        components.push({
          type: "agent",
          name: (data.name as string) || filename,
          slug: slugify(filename),
          description:
            (data.description as string) || body.trim().slice(0, 200),
          content: body.trim(),
          metadata: {},
        });
      }

      // Discover skills (skills/*/SKILL.md)
      const skillFiles = tree.filter(
        (f) =>
          f.type === "blob" &&
          new RegExp(`^${prefix}skills/[^/]+/SKILL\\.md$`).test(f.path),
      );
      for (const sf of skillFiles) {
        const raw = await fetchGitHubFile(owner, repo, sf.path);
        if (!raw) continue;
        const { data, body } = parseFrontmatter(raw);
        const parts = sf.path.split("/");
        const dirName = parts[parts.indexOf("skills") + 1] ?? "";

        components.push({
          type: "skill",
          name: (data.name as string) || dirName,
          slug: slugify(dirName),
          description:
            (data.description as string) || body.trim().slice(0, 200),
          content: body.trim(),
          metadata: {},
        });
      }

      // Discover commands (commands/*.md)
      const commandFiles = tree.filter(
        (f) =>
          f.type === "blob" &&
          new RegExp(`^${prefix}commands/.*\\.md$`).test(f.path),
      );
      for (const cf of commandFiles) {
        const raw = await fetchGitHubFile(owner, repo, cf.path);
        if (!raw) continue;
        const { data, body } = parseFrontmatter(raw);
        const filename = cf.path.split("/").pop()?.replace(".md", "") ?? "";

        components.push({
          type: "command",
          name: filename,
          slug: slugify(filename),
          description:
            (data.description as string) || body.trim().slice(0, 200),
          content: body.trim(),
          metadata: {},
        });
      }

      // Discover hooks (hooks/hooks.json)
      const hooksContent = await fetchGitHubFile(
        owner,
        repo,
        `${prefix}hooks/hooks.json`,
      );
      if (hooksContent) {
        try {
          const hooksConfig = JSON.parse(hooksContent);
          components.push({
            type: "hook",
            name: "hooks",
            slug: `hooks${prefix ? `-${slugify(prefix)}` : ""}`,
            description: "Event hooks configuration",
            content: JSON.stringify(hooksConfig, null, 2),
            metadata: {},
          });
        } catch {
          // ignore
        }
      }

      // Discover LSP servers (.lsp.json)
      const lspContent = await fetchGitHubFile(
        owner,
        repo,
        `${prefix}.lsp.json`,
      );
      if (lspContent) {
        try {
          const lspConfig = JSON.parse(lspContent);
          for (const [name, config] of Object.entries(lspConfig)) {
            components.push({
              type: "lsp_server",
              name,
              slug: slugify(name),
              description: `LSP server: ${name}`,
              content: JSON.stringify(config, null, 2),
              metadata: config as Record<string, unknown>,
            });
          }
        } catch {
          // ignore
        }
      }
    }

    // Deduplicate components by slug+type
    const seen = new Set<string>();
    const deduped = components.filter((c) => {
      const key = `${c.type}:${c.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (deduped.length === 0) {
      const scannedPrefixes = prefixes
        .map((p) => (p === "" ? "repo root" : p.replace(/\/$/, "")))
        .join(", ");
      const hints = [
        "rules/*.mdc",
        ".mcp.json or mcp.json",
        "skills/*/SKILL.md",
        "agents/*.md",
        "commands/*.md",
        "hooks/hooks.json",
        ".lsp.json",
      ];
      throw new ActionError(
        `No plugin components found in: ${scannedPrefixes}. ` +
          `We looked for: ${hints.join(", ")}. ` +
          `Make sure your repo follows the Open Plugins standard (https://open-plugins.com).`,
      );
    }

    const author = manifest.author as Record<string, string> | undefined;

    const result: ParsedPlugin = {
      name: (manifest.name as string) || repo,
      description:
        (manifest.description as string) || `${repo} plugin for Cursor`,
      version: (manifest.version as string) || "1.0.0",
      logo: manifest.logo as string | undefined,
      homepage: (manifest.homepage as string) || undefined,
      repository: `https://github.com/${owner}/${repo}`,
      license: manifest.license as string | undefined,
      keywords: (manifest.keywords as string[]) || [],
      author_name: author?.name,
      author_url: author?.url || author?.email,
      author_avatar: author?.avatar,
      components: deduped,
    };

    return result;
  });
