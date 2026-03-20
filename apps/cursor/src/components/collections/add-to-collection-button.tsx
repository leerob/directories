"use client";

import {
  addItemToCollectionAction,
  quickCreateCollectionAction,
} from "@/actions/upsert-collection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CollectionEntityType } from "@/lib/collections";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type CollectionItem = {
  entity_type: CollectionEntityType;
  entity_id: string;
  plugin_id: string;
  title: string;
  slug: string;
  description: string | null;
  plugin_name: string;
  plugin_slug: string;
  plugin_logo: string | null;
};

type UserCollection = {
  id: string;
  title: string;
  item_count: number;
};

export function AddToCollectionButton({ item }: { item: CollectionItem }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [userName, setUserName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addedTo, setAddedTo] = useState<string | null>(null);

  const { execute: addItem, isPending: isAdding } = useAction(
    addItemToCollectionAction,
    {
      onSuccess: () => {
        toast.success(`Added to collection`);
        setAddedTo("existing");
        setTimeout(() => {
          setOpen(false);
          setAddedTo(null);
        }, 800);
      },
      onError: ({ error }) => {
        toast.error(
          error.serverError ?? "Failed to add to collection",
        );
      },
    },
  );

  const { execute: quickCreate, isPending: isCreating } = useAction(
    quickCreateCollectionAction,
  );

  const handleOpen = useCallback(async () => {
    setLoading(true);
    setShowCreate(false);
    setAddedTo(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/sign-in";
      return;
    }

    const name =
      session.user.user_metadata?.name ??
      session.user.email?.split("@")[0] ??
      "My";

    setUserName(name);
    setNewTitle(`${name}'s Collection`);
    setNewDescription("A curated collection of plugins and tools.");

    const { data } = await supabase
      .from("collections")
      .select("id, title, item_count")
      .eq("owner_id", session.user.id)
      .order("updated_at", { ascending: false });

    const rows = (data ?? []) as UserCollection[];
    setCollections(rows);

    if (rows.length === 0) {
      setShowCreate(true);
    }

    setLoading(false);
    setOpen(true);
  }, []);

  const handleAddToExisting = useCallback(
    (collectionId: string) => {
      addItem({
        collectionId,
        item: { ...item, note: null },
      });
    },
    [addItem, item],
  );

  const handleQuickCreate = useCallback(() => {
    if (!newTitle.trim()) return;
    quickCreate({
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      item: { ...item, note: null },
    });
  }, [quickCreate, newTitle, newDescription, item]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        title="Add to collection"
      >
        <Plus className="size-3" />
        <span className="hidden sm:inline">Collect</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Add to collection" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Add to collection
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {showCreate
                ? "Create a new collection with this item"
                : "Choose a collection or create a new one"}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : showCreate ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="collection-title"
                  className="text-sm font-medium"
                >
                  Title
                </label>
                <Input
                  id="collection-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="collection-description"
                  className="text-sm font-medium"
                >
                  Description
                </label>
                <Input
                  id="collection-description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  maxLength={600}
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex size-7 items-center justify-center rounded-md border border-border bg-card">
                  {item.plugin_logo ? (
                    <img
                      src={item.plugin_logo}
                      alt=""
                      className="max-h-5 max-w-full object-contain"
                    />
                  ) : (
                    <Plus className="size-3 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.plugin_name}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {collections.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                    disabled={isCreating}
                  >
                    Back
                  </Button>
                )}
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleQuickCreate}
                  disabled={isCreating || !newTitle.trim()}
                >
                  {isCreating ? (
                    <Loader2 className="mr-2 size-3 animate-spin" />
                  ) : null}
                  Create & add
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddToExisting(col.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {col.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {col.item_count}{" "}
                        {col.item_count === 1 ? "item" : "items"}
                      </p>
                    </div>
                    {isAdding ? (
                      <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                    ) : (
                      <Plus className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-input hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Create new collection
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
