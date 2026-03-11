"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CommandEmpty, CommandInput } from "./ui/command";
import { CommandDialog, CommandItem, CommandList } from "./ui/command";

export interface PluginItem {
  title: string;
  slug: string;
}

export function CommandMenu({
  open,
  setOpen,
  plugins,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  plugins: PluginItem[];
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
        {plugins.map((plugin) => (
          <CommandItem
            key={plugin.slug}
            onSelect={() => {
              router.push(`/plugins/${plugin.slug}`);
              setOpen(false);
            }}
          >
            {plugin.title}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
