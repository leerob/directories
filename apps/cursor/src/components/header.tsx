"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

export const navigationLinks = [
  { href: "/plugins", label: "Plugins" },
  { href: "/collections", label: "Collections" },
  { href: "/events", label: "Events" },
  { href: "/jobs", label: "Jobs" },
  { href: "/members", label: "Members" },
  { href: "/board", label: "Board" },
] as const;

export function Header() {
  const pathname = usePathname();

  const isActiveLink = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="relative z-30 flex items-center justify-between">
      <div className="fixed inset-x-0 top-0 z-50 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-[56px] w-full max-w-[1300px] items-center justify-between px-4 text-[15px] md:h-[60px] md:px-6">
          <Link
            href="/"
            className="flex items-center text-foreground"
          >
            <img
              src="/logo-lockup.svg"
              alt="Cursor Directory"
              className="h-[18px] w-auto dark:brightness-100 brightness-0"
            />
          </Link>

          <MobileMenu />

          <div className="hidden items-center gap-2 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "chrome-label rounded-full px-3.5 py-2 font-medium transition-colors",
                  isActiveLink(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            <Suspense fallback={null}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
