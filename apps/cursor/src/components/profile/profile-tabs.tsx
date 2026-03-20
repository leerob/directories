"use client";

import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "plugins", label: "Plugins" },
  { key: "collections", label: "Collections" },
  { key: "companies", label: "Companies" },
  { key: "starred", label: "Starred" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProfileTabs({
  children,
}: {
  children: Record<TabKey, ReactNode>;
}) {
  const [tab, setTab] = useQueryState("tab");
  const activeTab = (TABS.some((t) => t.key === tab) ? tab : "posts") as TabKey;

  return (
    <div className="mt-12 w-full">
      <div className="inline-flex min-h-11 items-center justify-start rounded-full border border-border bg-card p-1 text-muted-foreground gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key === "posts" ? null : t.key)}
            className={cn(
              "inline-flex h-9 min-w-[96px] items-center justify-center whitespace-nowrap rounded-full px-4 text-sm font-medium tracking-[0.005em] transition-colors focus-visible:outline-none",
              activeTab === t.key
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[300px]">
        {children[activeTab]}
      </div>
    </div>
  );
}
