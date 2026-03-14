"use client";

import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { SearchInput } from "../search-input";
import { Button } from "../ui/button";
import { type PluginCardData, PluginCard } from "./plugin-card";

const ITEMS_PER_PAGE = 36;

export function PluginList({
  plugins,
  tags,
}: {
  plugins: PluginCardData[];
  tags: string[];
}) {
  const [search] = useQueryState("q");
  const [selectedTag, setSelectedTag] = useQueryState("tag");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const tabs = [
    { key: null, label: "All" },
    { key: "mcp", label: "MCPs" },
    { key: "rules", label: "Rules" },
  ] as const;

  const fuse = useMemo(
    () =>
      new Fuse(plugins, {
        keys: [
          { name: "name", weight: 3 },
          { name: "slug", weight: 1.5 },
          { name: "keywords", weight: 1.5 },
          { name: "description", weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [plugins],
  );

  const filtered = useMemo(() => {
    let result = plugins;

    if (selectedTag === "mcp") {
      result = result.filter((p) => p.type === "mcp" || p.type === "both");
    } else if (selectedTag === "rules") {
      result = result.filter((p) => p.type === "rules" || p.type === "both");
    }

    if (search && search.length > 0) {
      const fuseResults = fuse.search(search);
      result = fuseResults
        .filter((r) => {
          if (selectedTag === "mcp")
            return r.item.type === "mcp" || r.item.type === "both";
          if (selectedTag === "rules")
            return r.item.type === "rules" || r.item.type === "both";
          return true;
        })
        .map((r) => r.item);
    }

    return result;
  }, [plugins, search, selectedTag, fuse]);

  return (
    <div>
      <SearchInput
        placeholder={`Search ${plugins.length} plugins`}
        className="border-l-0 border-r-0 border-t-0 border-b-[1px] border-border px-0"
      />

      <div className="flex items-center gap-0 mt-6">
        {tabs.map((tab) => (
          <Button
            key={tab.label}
            variant="ghost"
            className={cn(
              "px-4 py-0 h-8 text-[#878787] bg-[#F5F5F5] dark:text-[#878787] dark:bg-[#1D1D1D]",
              (tab.key === null ? !selectedTag : selectedTag === tab.key) &&
                "bg-[#E5E5E5] text-black dark:bg-[#2C2C2C] dark:text-white",
            )}
            onClick={() => setSelectedTag(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {filtered.slice(0, visibleCount).map((plugin) => (
              <PluginCard key={plugin.slug} plugin={plugin} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                className="rounded-full border-border"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + ITEMS_PER_PAGE, filtered.length),
                  )
                }
              >
                Load more
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-24 flex flex-col items-center">
          <p className="text-center text-sm text-[#878787]">
            No plugins found
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full border-border"
            onClick={() => setSelectedTag(null)}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
