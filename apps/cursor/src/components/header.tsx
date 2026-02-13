"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { CommandMenu } from "./command-menu";
import { MobileMenu } from "./mobile-menu";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

const navigationLinks = [
  { href: "/rules", label: "Rules" },
  { href: "/board", label: "Trending" },
  { href: "/jobs", label: "Jobs" },
  { href: "/mcp", label: "MCPs" },
  { href: "/generate", label: "Generate" },
  { href: "/members", label: "Members" },
  { href: "/games", label: "Games" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/companies", label: "Companies" },
  { href: "/events", label: "Events" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const mainNavItems = navigationLinks.slice(0, 6);
  const dropdownNavItems = navigationLinks.slice(6);

  return (
    <div className="flex justify-between items-center mt-2 md:mt-0">
      <div className="md:fixed z-20 flex justify-between items-center top-0 px-6 py-2 w-full bg-background backdrop-filter backdrop-blur-sm bg-opacity-30">
        <Link href="/" className="font-medium font-mono text-sm">
          cursor.directory
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {mainNavItems.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                pathname.includes(link.href)
                  ? "text-primary"
                  : "text-[#878787]",
              )}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-transparent text-[#878787] px-0 focus-visible:ring-0"
              >
                More
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {dropdownNavItems.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      pathname.includes(link.href)
                        ? "text-primary"
                        : "text-[#878787]",
                    )}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
      <MobileMenu />
      <CommandMenu open={open} setOpen={setOpen} />
    </div>
  );
}
