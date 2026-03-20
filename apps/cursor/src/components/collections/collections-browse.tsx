"use client";

import type { CollectionSummary } from "@/data/collections";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { SearchInput } from "../search-input";
import { CollectionCard } from "./collection-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function CollectionsBrowse({
  collections,
}: {
  collections: CollectionSummary[];
}) {
  const [search] = useQueryState("q", { defaultValue: "" });
  const [sort, setSort] = useQueryState("sort");

  const filteredCollections = useMemo(() => {
    const term = search.trim().toLowerCase();
    let results = collections.filter((collection) => {
      if (!term) {
        return true;
      }

      const itemTerms = collection.preview_items.map(
        (item) => `${item.title} ${item.plugin_name}`,
      );

      return [
        collection.title,
        collection.description ?? "",
        collection.owner.name,
        collection.owner.slug,
        ...itemTerms,
      ].some((value) => value.toLowerCase().includes(term));
    });

    switch (sort) {
      case "popular":
        results = [...results].sort(
          (a, b) => b.follower_count - a.follower_count,
        );
        break;
      case "new":
        results = [...results].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      default:
        results = [...results].sort(
          (a, b) =>
            new Date(b.updated_at).getTime() -
            new Date(a.updated_at).getTime(),
        );
        break;
    }

    return results;
  }, [collections, search, sort]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search collections, curators, plugins, MCPs, rules, and skills..."
          className="max-w-[620px]"
          shallow={false}
        />

        <Select
          value={sort ?? "recent"}
          onValueChange={(value) => setSort(value === "recent" ? null : value)}
        >
          <SelectTrigger className="h-11 w-[180px] rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="recent">Recently updated</SelectItem>
            <SelectItem value="popular">Most followed</SelectItem>
            <SelectItem value="new">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCollections.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="mt-20 rounded-[24px] border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No collections found
        </div>
      )}
    </div>
  );
}
