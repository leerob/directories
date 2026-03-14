"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommandEmpty, CommandInput } from "./ui/command";
import { CommandDialog, CommandItem, CommandList } from "./ui/command";

interface PluginItem {
  name: string;
  slug: string;
}

export function CommandMenu({
  open,
  setOpen,
  items,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items?: PluginItem[];
}) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search for a plugin..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {(items ?? []).map((item) => (
          <CommandItem
            key={item.slug}
            onSelect={() => {
              router.push(`/plugins/${item.slug}`);
              setOpen(false);
            }}
          >
            {item.name}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
