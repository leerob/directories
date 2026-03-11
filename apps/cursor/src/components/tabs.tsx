"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { RulesSearch } from "./rules-search";
import { Button } from "./ui/button";

const tabs = [
  {
    name: "All",
    path: "/rules",
  },
  {
    name: "Popular",
    path: "/rules/popular",
  },
];

export function Tabs() {
  const selectedTab = usePathname();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        {tabs.map((tab) => (
          <Link href={tab.path} key={tab.name}>
            <Button
              variant="ghost"
              className={cn(
                "px-4 py-0 h-8 text-[#878787] bg-[#F5F5F5] dark:text-[#878787] dark:bg-[#1D1D1D]",
                selectedTab === tab.path &&
                  "bg-[#E5E5E5] text-black dark:bg-[#2C2C2C] dark:text-white",
              )}
            >
              {tab.name}
            </Button>
          </Link>
        ))}
      </div>

      <Suspense fallback={null}>
        <RulesSearch />
      </Suspense>
    </div>
  );
}
