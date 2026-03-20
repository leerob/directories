"use client";

import {
  createCollectionAction,
  updateCollectionAction,
} from "@/actions/upsert-collection";
import { cn } from "@/lib/utils";
import {
  compareCollectionEditorOptions,
  getRandomizedCollectionEditorOptions,
  getCollectionTypeLabel,
  type CollectionEditorOption,
  type CollectionItemRecord,
  type CollectionVisibility,
} from "@/lib/collections";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { PluginIconFallback } from "../plugins/plugin-icon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

type InitialCollection = {
  id: string;
  title: string;
  description: string | null;
  visibility: CollectionVisibility;
  items: CollectionItemRecord[];
};

type FilterKey = "all" | CollectionEditorOption["entity_type"];

function itemKey(item: {
  entity_type: string;
  entity_id: string;
}) {
  return `${item.entity_type}:${item.entity_id}`;
}

export function CollectionEditor({
  availableItems,
  popularPicks = [],
  initialCollection,
  defaultTitle,
  defaultDescription,
  ownerName,
}: {
  availableItems: CollectionEditorOption[];
  popularPicks?: CollectionEditorOption[];
  initialCollection?: InitialCollection;
  defaultTitle?: string;
  defaultDescription?: string;
  ownerName?: string;
}) {
  const [title, setTitle] = useState(initialCollection?.title ?? defaultTitle ?? "");
  const [description, setDescription] = useState(
    initialCollection?.description ?? defaultDescription ?? "",
  );
  const [visibility, setVisibility] = useState<CollectionVisibility>(
    initialCollection?.visibility ?? "public",
  );
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [browseSeed, setBrowseSeed] = useState(() => Math.random().toString(36));
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedItems, setSelectedItems] = useState<
    Array<CollectionEditorOption & { note: string | null }>
  >(
    initialCollection?.items.map((item) => ({
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      plugin_id: item.plugin_id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      plugin_name: item.plugin_name,
      plugin_slug: item.plugin_slug,
      plugin_logo: item.plugin_logo,
      note: item.note,
    })) ?? [],
  );

  const createAction = useAction(createCollectionAction);
  const updateAction = useAction(updateCollectionAction);

  const selectedSet = useMemo(
    () => new Set(selectedItems.map((item) => itemKey(item))),
    [selectedItems],
  );

  const availableCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: 0,
      plugin: 0,
      mcp_server: 0,
      rule: 0,
      skill: 0,
    };

    for (const item of availableItems) {
      if (selectedSet.has(itemKey(item))) {
        continue;
      }

      counts.all += 1;
      counts[item.entity_type] += 1;
    }

    return counts;
  }, [availableItems, selectedSet]);

  useEffect(() => {
    setVisibleCount(24);
  }, [activeFilter, query]);

  const filteredItems = useMemo<CollectionEditorOption[]>(() => {
    const term = query.trim().toLowerCase();

    return getRandomizedCollectionEditorOptions(
      availableItems
      .filter((item) => !selectedSet.has(itemKey(item)))
      .filter((item) =>
        activeFilter === "all" ? true : item.entity_type === activeFilter,
      )
      .filter((item) => {
        if (!term) {
          return true;
        }

        return [
          item.title,
          item.plugin_name,
          item.description ?? "",
          getCollectionTypeLabel(item.entity_type),
        ].some((value) => value.toLowerCase().includes(term));
      }),
      browseSeed,
    );
  }, [activeFilter, availableItems, browseSeed, query, selectedSet]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const groupedItems = useMemo(() => {
    return {
      plugin: visibleItems.filter((item) => item.entity_type === "plugin"),
      mcp_server: visibleItems.filter((item) => item.entity_type === "mcp_server"),
      rule: visibleItems.filter((item) => item.entity_type === "rule"),
      skill: visibleItems.filter((item) => item.entity_type === "skill"),
    };
  }, [visibleItems]);

  const quickStartItems = useMemo(() => {
    if (query.trim().length > 0 || selectedItems.length > 0) {
      return [];
    }

    return popularPicks.filter((item) => !selectedSet.has(itemKey(item)));
  }, [popularPicks, query, selectedItems.length, selectedSet]);

  const selectedCounts = useMemo(() => {
    const counts = {
      plugin: 0,
      mcp_server: 0,
      rule: 0,
      skill: 0,
    };

    for (const item of selectedItems) {
      counts[item.entity_type] += 1;
    }

    return counts;
  }, [selectedItems]);

  const isSaving = createAction.isExecuting || updateAction.isExecuting;

  const addItem = (item: CollectionEditorOption) => {
    setSelectedItems((prev) => [...prev, { ...item, note: null }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    setSelectedItems((prev) => {
      const next = [...prev];
      const target = index + direction;

      if (target < 0 || target >= next.length) {
        return prev;
      }

      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSubmit = () => {
    const payload = {
      title,
      description: description || null,
      visibility,
      items: selectedItems.map((item) => ({
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        plugin_id: item.plugin_id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        plugin_name: item.plugin_name,
        plugin_slug: item.plugin_slug,
        plugin_logo: item.plugin_logo,
        note: item.note ?? null,
      })),
    };

    if (initialCollection) {
      updateAction.execute({
        collectionId: initialCollection.id,
        ...payload,
      });
      return;
    }

    createAction.execute(payload);
  };

  const filterTabs: Array<{
    key: FilterKey;
    label: string;
  }> = [
    { key: "all", label: "All" },
    { key: "plugin", label: "Plugins" },
    { key: "mcp_server", label: "MCPs" },
    { key: "rule", label: "Rules" },
    { key: "skill", label: "Skills" },
  ];

  const submitLabel = initialCollection
    ? isSaving
      ? "Saving..."
      : "Save collection"
    : isSaving
      ? "Creating..."
      : "Create collection";

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-border bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_300px] md:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              Collection draft
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                Create a collection
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Add a clear title, pick the best plugins and components, and
                arrange them into a collection that is easy to understand and share.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                `${availableCounts.plugin} plugins`,
                `${availableCounts.mcp_server} MCPs`,
                `${availableCounts.rule} rules`,
                `${availableCounts.skill} skills`,
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-card/90 p-5 backdrop-blur">
            <div className="space-y-3">
              <h3 className="line-clamp-2 text-xl font-medium tracking-tight text-foreground">
                {title.trim() || defaultTitle || "Untitled collection"}
              </h3>
              <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                {description.trim() ||
                  defaultDescription ||
                  "Add a short explanation so people know why this collection matters."}
              </p>
            </div>

            <Separator className="my-5" />

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2.5 py-1">
                {selectedItems.length} items
              </span>
              <span className="rounded-full border border-border px-2.5 py-1">
                {visibility}
              </span>
              {ownerName && (
                <span className="rounded-full border border-border px-2.5 py-1">
                  by {ownerName}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-border bg-card p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Collection</p>
                <h3 className="mt-2 text-lg font-medium tracking-tight">
                  Collection details
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add the title, description, and visibility for this collection.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Title</p>
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Collection name"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Good names are specific: AI coding stack, DevTools picks, MCP
                  starter kit.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Description
                </p>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What makes this collection useful?"
                  className="min-h-[120px]"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Explain who this is for and what kind of workflow it supports.
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Visibility
                </p>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as CollectionVisibility)
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-card p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Discover</p>
                <h3 className="mt-2 text-lg font-medium tracking-tight">
                  Add items
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search across plugins and components, then add them to the collection.
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-[16px] border border-border bg-card px-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plugins, MCPs, rules, and skills"
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    activeFilter === tab.key
                      ? "border-input bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}{" "}
                  <span className="opacity-70">
                    (
                    {tab.key === "all"
                      ? availableCounts.all
                      : availableCounts[tab.key]}
                    )
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setBrowseSeed(Math.random().toString(36))}
                className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
                Shuffle
              </button>
            </div>

            {quickStartItems.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Popular picks
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  {quickStartItems.map((item) => (
                    <button
                      key={itemKey(item)}
                      type="button"
                      onClick={() => addItem(item)}
                      className="flex items-center gap-3 rounded-[18px] border border-border p-3 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex size-10 items-center justify-center rounded-[12px] border border-border bg-muted p-2">
                        {item.plugin_logo ? (
                          <img
                            src={item.plugin_logo}
                            alt=""
                            className="max-h-7 max-w-full object-contain"
                          />
                        ) : (
                          <PluginIconFallback
                            size={28}
                            bordered={false}
                            transparent
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-foreground">
                          {item.title}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {getCollectionTypeLabel(item.entity_type)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {(
                [
                  ["plugin", groupedItems.plugin],
                  ["mcp_server", groupedItems.mcp_server],
                  ["rule", groupedItems.rule],
                  ["skill", groupedItems.skill],
                ] as const
              )
                .filter(([, items]) => items.length > 0)
                .map(([type, items]) => (
                  <div key={type}>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {getCollectionTypeLabel(type)}s
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {items.length} shown
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <button
                          key={itemKey(item)}
                          type="button"
                          onClick={() => addItem(item)}
                          className="flex w-full items-center gap-3 rounded-[18px] border border-border p-3 text-left transition-colors hover:bg-accent"
                        >
                          <div className="flex size-10 items-center justify-center rounded-[12px] border border-border bg-muted p-2">
                            {item.plugin_logo ? (
                              <img
                                src={item.plugin_logo}
                                alt=""
                                className="max-h-7 max-w-full object-contain"
                              />
                            ) : (
                              <PluginIconFallback
                                size={28}
                                bordered={false}
                                transparent
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-foreground">
                              {item.title}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {type !== "plugin"
                                ? `${item.plugin_name} · ${getCollectionTypeLabel(item.entity_type)}`
                                : "Plugin"}
                            </div>
                          </div>

                          <Plus className="size-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {filteredItems.length === 0 && (
                <div className="rounded-[18px] border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No matching items found
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Try another search term or switch back to a broader filter.
                  </p>
                </div>
              )}

              {filteredItems.length > visibleCount && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      setVisibleCount((current) =>
                        Math.min(current + 24, filteredItems.length),
                      )
                    }
                  >
                    Load more items
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[24px] border border-border bg-card p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="section-eyebrow">Preview</p>
                <h3 className="mt-2 text-lg font-medium tracking-tight">
                  Review and reorder
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reorder items until the collection looks right from top to bottom.
                </p>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border px-2.5 py-1">
                {selectedItems.length} items
              </span>
              {selectedCounts.plugin > 0 && (
                <span className="rounded-full border border-border px-2.5 py-1">
                  {selectedCounts.plugin} plugins
                </span>
              )}
              {selectedCounts.mcp_server > 0 && (
                <span className="rounded-full border border-border px-2.5 py-1">
                  {selectedCounts.mcp_server} MCPs
                </span>
              )}
              {selectedCounts.rule > 0 && (
                <span className="rounded-full border border-border px-2.5 py-1">
                  {selectedCounts.rule} rules
                </span>
              )}
              {selectedCounts.skill > 0 && (
                <span className="rounded-full border border-border px-2.5 py-1">
                  {selectedCounts.skill} skills
                </span>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              className="mb-5 w-full"
              disabled={isSaving || title.trim().length < 2 || !selectedItems.length}
              onClick={handleSubmit}
            >
              {submitLabel}
            </Button>

            <p className="mb-5 text-xs leading-5 text-muted-foreground">
              Tip: the best collections have a clear title, a useful description,
              and a strong top few items.
            </p>

            {selectedItems.length > 0 ? (
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div
                    key={itemKey(item)}
                    className="rounded-[20px] border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 items-center justify-center rounded-[14px] border border-border bg-muted p-2.5">
                        {item.plugin_logo ? (
                          <img
                            src={item.plugin_logo}
                            alt=""
                            className="max-h-8 max-w-full object-contain"
                          />
                        ) : (
                          <PluginIconFallback
                            size={32}
                            bordered={false}
                            transparent
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.entity_type === "plugin"
                            ? "Plugin"
                            : `${getCollectionTypeLabel(item.entity_type)} · ${item.plugin_name}`}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === selectedItems.length - 1}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-border px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">
                  Start by adding your first item
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  A strong first collection usually mixes one or two core plugins
                  with a few specific MCPs, rules, or skills.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
