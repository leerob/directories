"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

type MenuSection = {
  tag: string;
  slug: string;
  rulesCount: number;
};

export function Menu({ sections }: { sections: MenuSection[] }) {
  return (
    <aside className="w-64 p-4 flex flex-col">
      <ScrollArea className="flex-grow">
        <div className="space-y-1">
          {sections.map((section) => (
            <Link href={`/plugins?tag=${section.slug}`} key={section.tag}>
              <Button variant="ghost" className="w-full justify-start">
                {section.tag}
                <span className="ml-auto text-[#878787]">
                  {section.rulesCount}
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <Separator className="my-4" />
      <a
        href="https://github.com/pontusab/cursor.directory"
        target="_blank"
        rel="noreferrer"
      >
        <Button
          className="w-full bg-[#F5F5F3]/30 text-black border border-black rounded-full items-center justify-center gap-2 font-medium hidden md:flex dark:text-white dark:border-white"
          variant="outline"
        >
          <span>Submit</span> <PlusIcon className="w-4 h-4" />
        </Button>
      </a>
    </aside>
  );
}
