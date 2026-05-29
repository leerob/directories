"use client";

import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { trackInstallAction } from "@/actions/track-install";
import { CursorDeepLink } from "@/components/cursor-deeplink";
import { Card, CardContent } from "@/components/ui/card";
import type { PluginRow } from "@/data/queries";
import { cn, formatCount } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { PluginIconFallback } from "./plugin-icon";
import { StarButton } from "./star-button";
import { VerifiedBadge } from "./verified-badge";
import { PluginOwnerMenu } from "./plugin-owner-menu";
import { VerifyControls } from "./verify-controls";

function isValidImageUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function PluginLogo({
  logo,
  name,
  size = 40,
}: {
  logo: string | null;
  name: string;
  size?: number;
}) {
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

// Beyond this URL length, the cursor:// deeplink is unreliable: OS protocol
// handlers and/or Cursor's URL parser silently drop or truncate the URL,
// causing the editor to either no-op or throw "URI malformed" on its
// decodeURIComponent call. Above the threshold we fall back to copy-to-clipboard
// instead of a broken Add to Cursor button. See community-plugins#363.
const MAX_DEEPLINK_URL_LENGTH = 8000;

function toBase64(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8").toString("base64");
  }
  // Browser fallback: btoa only accepts Latin-1, so round-trip through UTF-8 first.
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    ),
  );
}

function buildMCPInstallDeepLink(name: string, config: string) {
  // `+` in a query string decodes to a space, so the base64 must be
  // URL-encoded or Cursor base64-decodes garbage and throws "Not valid JSON".
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encodeURIComponent(toBase64(config))}`;
}

function ScanStatusBanner({
  plugin,
  isOwner,
}: {
  plugin: PluginRow;
  isOwner: boolean;
}) {
  const status = plugin.scan_status;

  if (status === "safe") return null;
  if (status === "unscanned") return null;
  if (status === "flagged" && plugin.active && !isOwner) return null;
  if (!isOwner && status === "error") return null;

  if (status === "pending" || status === "scanning") {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {isOwner
            ? "Scanning your plugin… it will appear publicly once the security agent finishes."
            : "Plugin is being verified."}
        </span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <ShieldAlert className="size-4 text-amber-500" />
        <span className="text-sm text-amber-600 dark:text-amber-400">
          Scan failed. An admin will re-run it shortly.
        </span>
      </div>
    );
  }

  if (status === "flagged") {
    const reasons = plugin.flag_reasons ?? [];
    const live = plugin.active;
    return (
      <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {live
                ? "Flagged by the security agent — pending manual review."
                : "Flagged by the security agent. Hidden from the directory pending manual review."}
            </p>
            {isOwner && plugin.flag_summary && (
              <p className="mt-1 text-sm text-red-600/90 dark:text-red-400/90">
                {plugin.flag_summary}
              </p>
            )}
            {isOwner && reasons.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-red-600/80 dark:text-red-400/80">
                {reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            )}
            {isOwner && (
              <p className="mt-2 text-xs text-red-600/80 dark:text-red-400/80">
                <Link
                  href={`/plugins/${plugin.slug}/edit`}
                  className="underline underline-offset-2"
                >
                  Edit your plugin
                </Link>{" "}
                and resubmit to trigger another scan.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

type ComponentType =
  | "rule"
  | "mcp_server"
  | "skill"
  | "agent"
  | "hook"
  | "lsp_server"
  | "command";

const COMPONENT_LABELS: Record<ComponentType, string> = {
  rule: "Rules",
  mcp_server: "MCP Servers",
  skill: "Skills",
  agent: "Agents",
  hook: "Hooks",
  lsp_server: "LSP Servers",
  command: "Commands",
};

export function PluginDetailView({ plugin }: { plugin: PluginRow }) {
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

  const { execute: trackInstall } = useAction(trackInstallAction, {
    onSuccess: ({ data }) => {
      if (data?.tracked) {
        setInstallCount((c) => c + 1);
      } else if (data?.rateLimited) {
        toast("Too many installs right now. Please try again in a bit.");
      }
    },
  });

  const handleInstall = useCallback(() => {
    trackInstall({ pluginId: plugin.id, slug: plugin.slug });
  }, [plugin.id, plugin.slug, trackInstall]);

  const components = plugin.plugin_components ?? [];
  const componentTypes = [
    ...new Set(components.map((c) => c.type)),
  ] as ComponentType[];
  const [activeTab, setActiveTab] = useState<ComponentType>(
    componentTypes[0] ?? "rule",
  );

  const rules = components.filter((c) => c.type === "rule");
  const mcps = components.filter((c) => c.type === "mcp_server");
  const activeComponents = components.filter((c) => c.type === activeTab);

  const [expandedRule, setExpandedRule] = useState<string | null>(
    rules[0]?.slug ?? null,
  );
  const [expandedMcp, setExpandedMcp] = useState<string | null>(
    mcps[0]?.slug ?? null,
  );

  // Component content stays visible for inactive plugins so owners can review;
  // only one-click install is hidden.
  const installable = plugin.active === true;

  return (
    <div className="min-h-screen px-4 pt-24 md:pt-32">
      <div className="page-shell max-w-4xl px-0 py-8">
        <ScanStatusBanner plugin={plugin} isOwner={isOwner} />
        {isOwner && !plugin.active && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <span className="text-sm text-muted-foreground">
              This plugin is unpublished and hidden from the directory.
            </span>
          </div>
        )}
        <div className="mb-6 flex items-center gap-4">
          <PluginLogo logo={plugin.logo} name={plugin.name} size={40} />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {plugin.name}
                </h1>
                {plugin.verified && <VerifiedBadge size="md" />}
              </div>
              <div className="flex items-center gap-2">
                <VerifyControls plugin={plugin} />
                <PluginOwnerMenu plugin={plugin} />
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
                  <Download className="size-3.5" />
                  <span className="text-xs">{formatCount(installCount)}</span>
                </span>
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
                href={`/?q=${encodeURIComponent(kw)}`}
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
            installable={installable}
          />
        )}

        {activeTab === "mcp_server" && mcps.length > 0 && (
          <McpSection
            mcps={mcps}
            onInstall={handleInstall}
            installable={installable}
            expandedMcp={expandedMcp}
            setExpandedMcp={setExpandedMcp}
          />
        )}

        {activeTab !== "rule" &&
          activeTab !== "mcp_server" &&
          activeComponents.length > 0 && (
            <GenericComponentSection
              components={activeComponents}
              type={activeTab}
              onInstall={handleInstall}
              installable={installable}
            />
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
  installable,
}: {
  rules: NonNullable<PluginRow["plugin_components"]>;
  expandedRule: string | null;
  setExpandedRule: (slug: string | null) => void;
  onInstall: () => void;
  installable: boolean;
}) {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">
        {rules.length} {rules.length === 1 ? "rule" : "rules"}
      </h2>
      <div className="space-y-3">
        {rules.map((rule) => {
          const isExpanded = expandedRule === rule.slug;
          const ruleContent = rule.content ?? "";
          const deepLink = buildRuleDeepLink(rule.slug, ruleContent);
          const deepLinkUsable = deepLink.length <= MAX_DEEPLINK_URL_LENGTH;

          return (
            <div key={rule.slug} className="rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left"
                  onClick={() => setExpandedRule(isExpanded ? null : rule.slug)}
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
                {installable ? (
                  deepLinkUsable ? (
                    <a
                      href={deepLink}
                      className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      onClick={onInstall}
                    >
                      Add to Cursor
                    </a>
                  ) : (
                    <CopyButton
                      text={ruleContent}
                      onCopy={onInstall}
                      title="Rule too large to install via deeplink — copy and paste into Cursor"
                    />
                  )
                ) : null}
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
      return {
        name: keys[0],
        config: servers[keys[0]] as Record<string, unknown>,
      };
    }
  }

  // Content is already a raw config (no mcpServers wrapper)
  return { name: (meta?.name as string) ?? "server", config: parsed };
}

function McpSection({
  mcps,
  onInstall,
  installable,
  expandedMcp,
  setExpandedMcp,
}: {
  mcps: NonNullable<PluginRow["plugin_components"]>;
  onInstall: () => void;
  installable: boolean;
  expandedMcp: string | null;
  setExpandedMcp: (slug: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      {mcps.map((mcp) => {
        const meta = mcp.metadata as Record<string, unknown>;
        const link = meta?.link as string | undefined;
        const mcpLink = meta?.mcp_link as string | undefined;

        let installLink = mcpLink ?? null;
        let configPreview: string | null = null;
        try {
          const resolved = resolveMcpConfig(mcp.content, meta);
          if (resolved) {
            const serialized = JSON.stringify(resolved.config, null, 2);
            configPreview = serialized;
            if (!installLink) {
              installLink = buildMCPInstallDeepLink(
                resolved.name,
                JSON.stringify(resolved.config),
              );
            }
          }
        } catch {
          installLink = installLink ?? null;
        }
        if (!configPreview && mcp.content) {
          configPreview = mcp.content;
        }

        const isExpanded = expandedMcp === mcp.slug;
        const canExpand = Boolean(configPreview);

        return (
          <div key={mcp.slug} className="rounded-lg border border-border">
            <div className="flex items-center justify-between gap-4 p-4">
              <button
                type="button"
                className="flex items-center gap-2 min-w-0 text-left disabled:cursor-default"
                onClick={() =>
                  canExpand && setExpandedMcp(isExpanded ? null : mcp.slug)
                }
                disabled={!canExpand}
              >
                {canExpand ? (
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                  MCP
                </span>
                <span className="truncate text-sm font-medium">{mcp.name}</span>
              </button>
              <div className="flex items-center gap-3 shrink-0">
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
                {installable && installLink ? (
                  <CursorDeepLink
                    mcp_link={installLink}
                    onInstall={onInstall}
                  />
                ) : installable && mcp.content ? (
                  <CopyButton text={mcp.content} onCopy={onInstall} />
                ) : null}
              </div>
            </div>

            {isExpanded && configPreview && (
              <div className="px-4 pb-4">
                <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground/80">
                  This config will be passed to Cursor on install. Inspect
                  `command`, `args`, and `env` before continuing.
                </p>
                <div className="max-h-96 overflow-y-auto rounded-lg border border-border bg-editor p-4 font-mono text-xs leading-6 text-muted-foreground">
                  <code className="block whitespace-pre-wrap">
                    {configPreview}
                  </code>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({
  text,
  onCopy,
  title,
}: {
  text: string;
  onCopy?: () => void;
  title?: string;
}) {
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
      title={title}
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

function isComponentInstallable(
  c: NonNullable<PluginRow["plugin_components"]>[number],
): boolean {
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
              <ChevronDown
                className={cn(
                  "size-3 transition-transform",
                  runnerOpen && "rotate-180",
                )}
              />
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
                      r === runner
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
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
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    listExpanded && "rotate-180",
                  )}
                />
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
              const typeLabel =
                COMPONENT_LABELS[comp.type as ComponentType] ?? comp.type;
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
                  <span
                    className={cn(
                      "truncate",
                      checked ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
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
  installable,
}: {
  components: NonNullable<PluginRow["plugin_components"]>;
  type: ComponentType;
  onInstall: () => void;
  installable: boolean;
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
                {installable &&
                  comp.content &&
                  (() => {
                    if (type !== "command") {
                      return (
                        <CopyButton text={comp.content} onCopy={onInstall} />
                      );
                    }
                    const deepLink = buildCommandDeepLink(
                      comp.slug,
                      comp.content,
                    );
                    if (deepLink.length > MAX_DEEPLINK_URL_LENGTH) {
                      return (
                        <CopyButton
                          text={comp.content}
                          onCopy={onInstall}
                          title="Command too large to install via deeplink — copy and paste into Cursor"
                        />
                      );
                    }
                    return (
                      <a
                        href={deepLink}
                        className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        onClick={onInstall}
                      >
                        Add to Cursor
                      </a>
                    );
                  })()}
              </div>
              {comp.description && (
                <p className="text-xs leading-5 text-muted-foreground">
                  {comp.description}
                </p>
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
