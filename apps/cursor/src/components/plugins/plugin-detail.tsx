"use client";

import { trackInstallAction } from "@/actions/track-install";
import { CursorDeepLink } from "@/components/cursor-deeplink";
import { Card, CardContent } from "@/components/ui/card";
import type { PluginRow } from "@/data/queries";
import { cn, formatCount } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { PluginIconFallback } from "./plugin-icon";
import { Check, ChevronDown, Copy, Download, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { StarButton } from "./star-button";
import { AddToCollectionButton } from "@/components/collections/add-to-collection-button";

type PluginInfo = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

function buildCollectionItem(
  component: NonNullable<PluginRow["plugin_components"]>[number],
  plugin: PluginInfo,
) {
  return {
    entity_type: component.type as "rule" | "mcp_server" | "skill" | "plugin",
    entity_id: component.id,
    plugin_id: plugin.id,
    title: component.name,
    slug: component.slug,
    description: component.description,
    plugin_name: plugin.name,
    plugin_slug: plugin.slug,
    plugin_logo: plugin.logo,
  };
}

function isValidImageUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function PluginLogo({ logo, name, size = 40 }: { logo: string | null; name: string; size?: number }) {
  const [error, setError] = useState(false);
  const validUrl = isValidImageUrl(logo);

  if (!validUrl || error) {
    return <PluginIconFallback size={size} />;
  }

  return (
    <Image
      src={logo}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={cn(
        "rounded-lg border border-border bg-card p-1",
        logo.endsWith(".svg") && "invert",
      )}
      onError={() => setError(true)}
    />
  );
}

function buildRuleDeepLink(name: string, content: string) {
  return `cursor://anysphere.cursor-deeplink/rule?name=${encodeURIComponent(name)}&text=${encodeURIComponent(content)}`;
}

function buildCommandDeepLink(name: string, content: string) {
  return `cursor://anysphere.cursor-deeplink/command?name=${encodeURIComponent(name)}&text=${encodeURIComponent(content)}`;
}

function buildMCPInstallDeepLink(name: string, config: string) {
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${btoa(config)}`;
}

type ComponentType = "rule" | "mcp_server" | "skill" | "agent" | "hook" | "lsp_server" | "command";

const COMPONENT_LABELS: Record<ComponentType, string> = {
  rule: "Rules",
  mcp_server: "MCP Servers",
  skill: "Skills",
  agent: "Agents",
  hook: "Hooks",
  lsp_server: "LSP Servers",
  command: "Commands",
};

export function PluginDetailView({
  plugin,
}: {
  plugin: PluginRow;
}) {
  const [isOwner, setIsOwner] = useState(false);
  const [installCount, setInstallCount] = useState(plugin.install_count);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && plugin.owner_id === session.user.id) {
        setIsOwner(true);
      }
    });
  }, [plugin.owner_id]);

  const pluginInfo: PluginInfo = {
    id: plugin.id,
    name: plugin.name,
    slug: plugin.slug,
    logo: plugin.logo,
  };

  const { execute: trackInstall } = useAction(trackInstallAction);

  const handleInstall = useCallback(() => {
    setInstallCount((c) => c + 1);
    trackInstall({ pluginId: plugin.id, slug: plugin.slug });
  }, [plugin.id, plugin.slug, trackInstall]);

  const components = plugin.plugin_components ?? [];
  const componentTypes = [...new Set(components.map((c) => c.type))] as ComponentType[];
  const [activeTab, setActiveTab] = useState<ComponentType>(componentTypes[0] ?? "rule");

  const rules = components.filter((c) => c.type === "rule");
  const mcps = components.filter((c) => c.type === "mcp_server");
  const activeComponents = components.filter((c) => c.type === activeTab);

  const [expandedRule, setExpandedRule] = useState<string | null>(
    rules[0]?.slug ?? null,
  );

  return (
    <div className="min-h-screen px-4 pt-24 md:pt-32">
      <div className="page-shell max-w-4xl px-0 py-8">
        {!plugin.active && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Under review — this plugin is pending approval.
            </span>
          </div>
        )}
        <div className="mb-6 flex items-center gap-4">
          <PluginLogo logo={plugin.logo} name={plugin.name} size={40} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold tracking-tight">{plugin.name}</h1>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                  <Download className="size-3.5" />
                  <span className="text-xs">{formatCount(installCount)}</span>
                </span>
                {isOwner && (
                  <Link
                    href={`/plugins/${plugin.slug}/edit`}
                    className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Link>
                )}
                <StarButton
                  pluginId={plugin.id}
                  slug={plugin.slug}
                  starCount={plugin.star_count}
                />
              </div>
            </div>
            {plugin.author_name && (
              <p className="mt-1 text-sm text-muted-foreground">
                by{" "}
                {plugin.author_url ? (
                  <Link
                    href={plugin.author_url}
                    target="_blank"
                    className="border-b border-dashed border-input text-foreground"
                  >
                    {plugin.author_name}
                  </Link>
                ) : (
                  plugin.author_name
                )}
              </p>
            )}
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {plugin.description}
        </p>

        <div className="mb-10 flex items-center gap-4">
          {plugin.homepage && (
            <Link
              href={plugin.homepage}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>Homepage</span>
              <ExternalLinkIcon />
            </Link>
          )}
          {plugin.repository && (
            <Link
              href={plugin.repository}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>Source</span>
              <ExternalLinkIcon />
            </Link>
          )}
        </div>

        {plugin.keywords.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {plugin.keywords.map((kw) => (
              <Link
                key={kw}
                href={`/plugins?q=${encodeURIComponent(kw)}`}
                className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground"
              >
                {kw}
              </Link>
            ))}
          </div>
        )}

        {/* CLI install section hidden for now */}

        {componentTypes.length > 1 && (
          <div className="mb-6 flex items-center gap-2">
            {componentTypes.map((type) => {
              const count = components.filter((c) => c.type === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    "rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    activeTab === type && "bg-accent text-foreground",
                  )}
                  onClick={() => setActiveTab(type)}
                >
                  {COMPONENT_LABELS[type]} ({count})
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "rule" && rules.length > 0 && (
          <RulesSection
            rules={rules}
            expandedRule={expandedRule}
            setExpandedRule={setExpandedRule}
            onInstall={handleInstall}
            plugin={pluginInfo}
          />
        )}

        {activeTab === "mcp_server" && mcps.length > 0 && (
          <McpSection mcps={mcps} onInstall={handleInstall} plugin={pluginInfo} />
        )}

        {activeTab !== "rule" && activeTab !== "mcp_server" && activeComponents.length > 0 && (
          <GenericComponentSection components={activeComponents} type={activeTab} onInstall={handleInstall} plugin={pluginInfo} />
        )}
      </div>
    </div>
  );
}

function RulesSection({
  rules,
  expandedRule,
  setExpandedRule,
  onInstall,
  plugin,
}: {
  rules: NonNullable<PluginRow["plugin_components"]>;
  expandedRule: string | null;
  setExpandedRule: (slug: string | null) => void;
  onInstall: () => void;
  plugin: PluginInfo;
}) {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">
        {rules.length} {rules.length === 1 ? "rule" : "rules"}
      </h2>
      <div className="space-y-3">
        {rules.map((rule) => {
          const isExpanded = expandedRule === rule.slug;

          return (
            <div key={rule.slug} className="rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left"
                  onClick={() =>
                    setExpandedRule(isExpanded ? null : rule.slug)
                  }
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                  <span className="truncate text-sm font-medium">
                    {rule.name}
                  </span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <AddToCollectionButton
                    item={buildCollectionItem(rule, plugin)}
                  />
                  <a
                    href={buildRuleDeepLink(rule.slug, rule.content ?? "")}
                    className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInstall();
                    }}
                  >
                    Add to Cursor
                  </a>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="max-h-96 overflow-y-auto rounded-lg border border-border bg-editor p-4 font-mono text-xs leading-6 text-muted-foreground">
                    <code className="block whitespace-pre-wrap">
                      {rule.content}
                    </code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function resolveMcpConfig(
  content: string | null,
  meta: Record<string, unknown>,
): { name: string; config: Record<string, unknown> } | null {
  // Try content first, then metadata.config
  let parsed: Record<string, unknown> | null = null;

  if (content) {
    try {
      parsed = JSON.parse(content);
    } catch {
      return null;
    }
  } else {
    const cfg = (meta?.config as Record<string, unknown>) ?? {};
    if (cfg.mcpServers) {
      parsed = { mcpServers: cfg.mcpServers } as Record<string, unknown>;
    }
  }

  if (!parsed) return null;

  // Unwrap mcpServers wrapper if present
  const servers = parsed.mcpServers as Record<string, unknown> | undefined;
  if (servers && typeof servers === "object") {
    const keys = Object.keys(servers);
    if (keys.length > 0) {
      return { name: keys[0], config: servers[keys[0]] as Record<string, unknown> };
    }
  }

  // Content is already a raw config (no mcpServers wrapper)
  return { name: (meta?.name as string) ?? "server", config: parsed };
}

function McpSection({
  mcps,
  onInstall,
  plugin,
}: {
  mcps: NonNullable<PluginRow["plugin_components"]>;
  onInstall: () => void;
  plugin: PluginInfo;
}) {
  return (
    <div className="space-y-3">
      {mcps.map((mcp) => {
        const meta = mcp.metadata as Record<string, unknown>;
        const link = meta?.link as string | undefined;
        const mcpLink = meta?.mcp_link as string | undefined;

        let installLink = mcpLink ?? null;
        if (!installLink) {
          const resolved = resolveMcpConfig(mcp.content, meta);
          if (resolved) {
            installLink = buildMCPInstallDeepLink(resolved.name, JSON.stringify(resolved.config));
          }
        }

        return (
          <div
            key={mcp.slug}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                MCP
              </span>
              <span className="truncate text-sm font-medium">{mcp.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <AddToCollectionButton
                item={buildCollectionItem(mcp, plugin)}
              />
              <div className="flex items-center gap-3">
                {link && (
                  <Link
                    href={link}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    target="_blank"
                  >
                    <span>Source</span>
                    <ExternalLinkIcon />
                  </Link>
                )}
                {installLink ? (
                  <CursorDeepLink mcp_link={installLink} onInstall={onInstall} />
                ) : mcp.content ? (
                  <CopyButton text={mcp.content} onCopy={onInstall} />
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({ text, onCopy }: { text: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    });
  }, [text, onCopy]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="size-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  );
}

function hasInstallableComponents(
  components: NonNullable<PluginRow["plugin_components"]>,
): boolean {
  return components.some(isComponentInstallable);
}

const PACKAGE_RUNNERS = ["npx", "bunx", "pnpm dlx"] as const;
type PackageRunner = (typeof PACKAGE_RUNNERS)[number];

const STORAGE_KEY = "install-plugin-runner";

function getStoredRunner(): PackageRunner {
  if (typeof window === "undefined") return "npx";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && PACKAGE_RUNNERS.includes(stored as PackageRunner)) {
    return stored as PackageRunner;
  }
  return "npx";
}

function isComponentInstallable(c: NonNullable<PluginRow["plugin_components"]>[number]): boolean {
  if (c.content) return true;
  if (c.type === "mcp_server") {
    const meta = c.metadata as Record<string, unknown>;
    const config = meta?.config as Record<string, unknown> | undefined;
    return !!config?.mcpServers;
  }
  return false;
}

function CliInstallCommand({
  slug,
  components,
}: {
  slug: string;
  components: NonNullable<PluginRow["plugin_components"]>;
}) {
  const installable = components.filter(isComponentInstallable);
  const [runner, setRunner] = useState<PackageRunner>("npx");
  const [copied, setCopied] = useState(false);
  const [runnerOpen, setRunnerOpen] = useState(false);
  const [listExpanded, setListExpanded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(installable.map((c) => c.slug)),
  );

  useEffect(() => {
    setRunner(getStoredRunner());
  }, []);

  const allSelected = selected.size === installable.length;
  const noneSelected = selected.size === 0;

  const command = allSelected
    ? `${runner} install-plugin ${slug}`
    : `${runner} install-plugin ${slug} --only ${[...selected].join(",")}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  const handleSelectRunner = useCallback((r: PackageRunner) => {
    setRunner(r);
    setRunnerOpen(false);
    localStorage.setItem(STORAGE_KEY, r);
  }, []);

  const toggleComponent = useCallback((compSlug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(compSlug)) {
        next.delete(compSlug);
      } else {
        next.add(compSlug);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(installable.map((c) => c.slug)));
    }
  }, [allSelected, installable]);

  return (
    <div className="mb-10">
      <h2 className="section-eyebrow mb-3">Install via CLI</h2>
      <div className="rounded-lg border border-border bg-editor">
        <div className="flex items-stretch">
          <div className="relative">
            <button
              type="button"
              onClick={() => setRunnerOpen((v) => !v)}
              className="flex h-full items-center gap-1.5 border-r border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {runner}
              <ChevronDown className={cn("size-3 transition-transform", runnerOpen && "rotate-180")} />
            </button>
            {runnerOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[120px] rounded-md border border-border bg-popover py-1 shadow-md">
                {PACKAGE_RUNNERS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleSelectRunner(r)}
                    className={cn(
                      "flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors hover:bg-accent",
                      r === runner ? "text-foreground font-medium" : "text-muted-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="group flex flex-1 items-center gap-3 min-w-0 px-4 py-3 text-left"
          >
            <code className="truncate text-sm text-foreground">{command}</code>
          </button>
          <div className="flex items-center gap-2 shrink-0 pr-3">
            <span className="text-xs text-muted-foreground">
              {selected.size}/{installable.length}
            </span>
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </button>
            )}
            {installable.length > 1 && (
              <button
                type="button"
                onClick={() => setListExpanded((v) => !v)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown className={cn("size-3.5 transition-transform", listExpanded && "rotate-180")} />
              </button>
            )}
          </div>
        </div>

        {listExpanded && installable.length > 1 && (
          <div className="border-t border-border px-4 py-2 space-y-0.5">
            <button
              type="button"
              onClick={toggleAll}
              className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded-sm border",
                  allSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-muted-foreground",
                )}
              >
                {allSelected && <Check className="size-2.5" />}
              </span>
              <span>{allSelected ? "Deselect all" : "Select all"}</span>
            </button>
            <div className="h-px bg-border my-1" />
            {installable.map((comp) => {
              const checked = selected.has(comp.slug);
              const typeLabel = COMPONENT_LABELS[comp.type as ComponentType] ?? comp.type;
              return (
                <button
                  key={comp.slug}
                  type="button"
                  onClick={() => toggleComponent(comp.slug)}
                  className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-xs transition-colors hover:bg-accent"
                >
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      checked
                        ? "border-foreground bg-foreground text-background"
                        : "border-muted-foreground",
                    )}
                  >
                    {checked && <Check className="size-2.5" />}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded border border-border px-1 py-0.5 font-mono text-[10px] text-muted-foreground",
                    )}
                  >
                    {typeLabel}
                  </span>
                  <span className={cn("truncate", checked ? "text-foreground" : "text-muted-foreground")}>
                    {comp.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {noneSelected && (
        <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
          No components selected. Select at least one to install.
        </p>
      )}
    </div>
  );
}

function GenericComponentSection({
  components,
  type,
  onInstall,
  plugin,
}: {
  components: NonNullable<PluginRow["plugin_components"]>;
  type: ComponentType;
  onInstall: () => void;
  plugin: PluginInfo;
}) {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">
        {components.length} {COMPONENT_LABELS[type].toLowerCase()}
      </h2>
      <div className="space-y-3">
        {components.map((comp) => (
          <Card key={comp.slug} className="border-border bg-transparent">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-medium">{comp.name}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <AddToCollectionButton
                    item={buildCollectionItem(comp, plugin)}
                  />
                  {comp.content && (
                    type === "command" ? (
                      <a
                        href={buildCommandDeepLink(comp.slug, comp.content)}
                        className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={onInstall}
                      >
                        Add to Cursor
                      </a>
                    ) : (
                      <CopyButton text={comp.content} onCopy={onInstall} />
                    )
                  )}
                </div>
              </div>
              {comp.description && (
                <p className="text-xs leading-5 text-muted-foreground">{comp.description}</p>
              )}
              {comp.content && (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-editor p-4 font-mono text-xs leading-6 text-muted-foreground">
                  <code className="block whitespace-pre-wrap">
                    {comp.content}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_106_981"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="12"
        height="13"
      >
        <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_106_981)">
        <path
          d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
