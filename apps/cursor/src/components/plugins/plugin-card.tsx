"use client";

import type { Plugin } from "@directories/data/plugins";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function PluginCard({ plugin }: { plugin: Plugin }) {
  const displayName =
    plugin.mcpServers[0]?.metadata?.name ?? plugin.rules[0]?.title ?? plugin.slug;

  return (
    <Link href={`/plugins/${plugin.slug}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-accent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{displayName}</CardTitle>
              <p className="mt-1 text-sm text-[#878787]">
                {plugin.description}
              </p>
            </div>

            {plugin.logo ? (
              <img
                src={plugin.logo}
                alt={`${displayName} logo`}
                className="h-8 w-8 shrink-0 rounded-none object-contain"
              />
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-[#878787]">
              {plugin.rules.length} rule{plugin.rules.length === 1 ? "" : "s"}
            </span>

            {plugin.hasMcp ? (
              <span className="rounded-full border border-border px-2 py-1 text-[10px] uppercase tracking-wide text-[#878787]">
                MCP
              </span>
            ) : null}
          </div>

          {plugin.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {plugin.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs font-mono text-[#878787]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
