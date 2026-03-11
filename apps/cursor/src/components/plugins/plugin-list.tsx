"use client";

import type { Plugin } from "@directories/data/plugins";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { SearchInput } from "../search-input";
import { Button } from "../ui/button";
import { PluginCard } from "./plugin-card";

function matchesPlugin(plugin: Plugin, search: string) {
  const term = search.toLowerCase();
  return (
    plugin.slug.toLowerCase().includes(term) ||
    plugin.description.toLowerCase().includes(term) ||
    plugin.keywords.some((keyword) => keyword.toLowerCase().includes(term)) ||
    plugin.rules.some(
      (rule) =>
        rule.title.toLowerCase().includes(term) ||
        rule.content.toLowerCase().includes(term),
    ) ||
    plugin.mcpServers.some((server) =>
      (server.metadata?.description ?? "").toLowerCase().includes(term),
    )
  );
}

export function PluginList({
  plugins,
  showSearch = true,
  limit,
}: {
  plugins: Plugin[];
  showSearch?: boolean;
  limit?: number;
}) {
  const [search, setSearch] = useQueryState("q", {
    defaultValue: "",
  });

  const filteredPlugins = useMemo(() => {
    const normalized = search.trim();
    const result = normalized
      ? plugins.filter((plugin) => matchesPlugin(plugin, normalized))
      : plugins;

    return typeof limit === "number" ? result.slice(0, limit) : result;
  }, [plugins, search, limit]);

  return (
    <div className="space-y-8">
      {showSearch ? (
        <SearchInput
          placeholder="Search plugins, rules, and MCP servers"
          className="border-l-0 border-r-0 border-t-0 border-b-[1px] border-border px-0"
          shallow={false}
        />
      ) : null}

      {filteredPlugins.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlugins.map((plugin) => (
            <PluginCard key={plugin.slug} plugin={plugin} />
          ))}
        </div>
      ) : (
        <div className="mt-24 flex flex-col items-center">
          <div className="text-center text-sm text-[#878787]">
            No plugins found
          </div>

          <Button
            variant="outline"
            className="mt-4 rounded-full border-border"
            onClick={() => setSearch("")}
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
