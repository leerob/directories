"use client";

import {
  Check,
  ExternalLink,
  Loader2,
  PowerOff,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import {
  approvePluginAction,
  declinePluginAction,
  disablePluginAction,
  rerunPluginScanAction,
} from "@/actions/review-plugin";
import { Button } from "@/components/ui/button";
import type { PluginReviewFlag, PluginRow } from "@/data/queries";

type Variant = "pending" | "flagged" | "scanning";

function Score({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  if (value === null || value === undefined) return null;
  const tone =
    value >= 85
      ? "text-emerald-400 border-emerald-500/30"
      : value >= 60
        ? "text-amber-400 border-amber-500/30"
        : "text-red-400 border-red-500/30";
  return (
    <span
      className={`rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-mono ${tone}`}
    >
      {label} {value}
    </span>
  );
}

function FlagPill({ flag }: { flag: PluginReviewFlag }) {
  const tone =
    flag.severity === "critical"
      ? "border-red-500/50 text-red-400"
      : flag.severity === "high"
        ? "border-red-500/30 text-red-400"
        : flag.severity === "medium"
          ? "border-amber-500/30 text-amber-400"
          : "border-border text-muted-foreground";
  return (
    <div
      className={`rounded-md border bg-muted/30 px-2 py-1 text-[11px] ${tone}`}
    >
      <span className="font-mono uppercase">{flag.severity}</span>
      <span className="mx-1.5 opacity-40">·</span>
      <span className="font-mono">{flag.category}</span>
      <span className="mx-1.5 opacity-40">·</span>
      <span>{flag.message}</span>
    </div>
  );
}

function PluginReviewCard({
  plugin,
  variant,
}: {
  plugin: PluginRow;
  variant: Variant;
}) {
  const [dismissed, setDismissed] = useState(false);

  const { execute: approve, isExecuting: isApproving } = useAction(
    approvePluginAction,
    {
      onSuccess: () => {
        toast.success(`"${plugin.name}" approved and now live.`);
        setDismissed(true);
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to approve plugin.");
      },
    },
  );

  const { execute: decline, isExecuting: isDeclining } = useAction(
    declinePluginAction,
    {
      onSuccess: () => {
        toast.success(`"${plugin.name}" declined and removed.`);
        setDismissed(true);
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to decline plugin.");
      },
    },
  );

  const { execute: rerun, isExecuting: isRerunning } = useAction(
    rerunPluginScanAction,
    {
      onSuccess: () => toast.success(`Re-scan queued for "${plugin.name}".`),
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to rerun scan.");
      },
    },
  );

  const { execute: disable, isExecuting: isDisabling } = useAction(
    disablePluginAction,
    {
      onSuccess: () => {
        toast.success(`"${plugin.name}" disabled.`);
        setDismissed(true);
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Failed to disable plugin.");
      },
    },
  );

  if (dismissed) return null;

  const busy = isApproving || isDeclining || isRerunning || isDisabling;
  const componentCount = plugin.plugin_components?.length ?? 0;
  const componentTypes = [
    ...new Set(plugin.plugin_components?.map((c) => c.type) ?? []),
  ];
  const flags = plugin.flagged_reasons ?? [];

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-cursor">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/plugins/${plugin.slug}`}
            target="_blank"
            className="group flex items-center gap-1.5 truncate text-sm font-medium hover:underline"
          >
            {plugin.name}
            <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          {plugin.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {plugin.description}
            </p>
          )}

          {(plugin.security_score != null ||
            plugin.quality_score != null ||
            plugin.review_status) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {plugin.review_status && (
                <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {plugin.review_status}
                </span>
              )}
              <Score label="sec" value={plugin.security_score} />
              <Score label="qual" value={plugin.quality_score} />
              {plugin.last_scanned_at && (
                <span className="text-[10px] text-muted-foreground">
                  scanned {new Date(plugin.last_scanned_at).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {plugin.review_summary && (
            <p className="mt-3 text-xs text-muted-foreground italic">
              {plugin.review_summary}
            </p>
          )}

          {flags.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {flags.map((f) => (
                <FlagPill
                  key={`${f.severity}-${f.category}-${f.message}`}
                  flag={f}
                />
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {plugin.repository && (
              <a
                href={plugin.repository}
                target="_blank"
                rel="noreferrer"
                className="border-b border-border border-dashed hover:text-foreground transition-colors"
              >
                Repository
              </a>
            )}
            <span>
              {componentCount}{" "}
              {componentCount === 1 ? "component" : "components"}
            </span>
            {componentTypes.length > 0 && (
              <span className="text-text-tertiary">
                {componentTypes.join(", ")}
              </span>
            )}
            <span className="text-text-tertiary">
              {new Date(plugin.created_at).toLocaleDateString()}
            </span>
          </div>

          {plugin.keywords && plugin.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {plugin.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2">
          {variant !== "scanning" && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => rerun({ pluginId: plugin.id })}
            >
              {isRerunning ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              <span className="ml-1.5">Rerun scan</span>
            </Button>
          )}

          {variant === "flagged" && plugin.active && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => disable({ pluginId: plugin.id })}
            >
              {isDisabling ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <PowerOff className="size-3.5" />
              )}
              <span className="ml-1.5">Disable</span>
            </Button>
          )}

          {variant !== "scanning" && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => decline({ pluginId: plugin.id })}
              >
                {isDeclining ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                <span className="ml-1.5">Decline</span>
              </Button>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => approve({ pluginId: plugin.id })}
              >
                {isApproving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                <span className="ml-1.5">Approve</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PluginReviewList({
  plugins,
  variant = "pending",
}: {
  plugins: PluginRow[];
  variant?: Variant;
}) {
  if (plugins.length === 0) {
    const empty = {
      pending: "No pending plugins to review.",
      flagged: "No flagged plugins. Auto-review is keeping things clean.",
      scanning: "No scans running right now.",
    }[variant];

    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center shadow-cursor">
        <p className="text-sm text-muted-foreground">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plugins.map((plugin) => (
        <PluginReviewCard key={plugin.id} plugin={plugin} variant={variant} />
      ))}
    </div>
  );
}
