"use client";

import type { PluginCardData } from "@/components/plugins/plugin-card";
import { PluginCard } from "@/components/plugins/plugin-card";
import { CollectionCard } from "@/components/collections/collection-card";
import type { CollectionSummary } from "@/data/collections";
import Fuse from "fuse.js";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import type { ForumPost as ForumPostType } from "@/data/queries";
import { BoardPost } from "./board/board-post";
import { EventCard } from "./events/event-card";
import { ForumPost } from "./forum/forum-post";
import { GlobalSearchInput } from "./global-search-input";
import { HeroTitle } from "./hero-title";
import { type Job, JobsFeatured } from "./jobs/jobs-featured";
import { MembersCard } from "./members/members-card";

function matchesSearch(term: string, ...fields: (string | undefined | null)[]) {
  const lower = term.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
}

import type { Event } from "@/lib/luma";

export function Startpage({
  featuredPlugins,
  popularPlugins,
  allPlugins,
  recentPlugins,
  upcomingEvents,
  jobs,
  totalUsers,
  members,
  popularPosts,
  forumPosts,
  collections,
}: {
  featuredPlugins: PluginCardData[];
  popularPlugins: PluginCardData[];
  allPlugins: PluginCardData[];
  recentPlugins: PluginCardData[];
  upcomingEvents: Event[];
  jobs?: Job[] | null;
  totalUsers: number;
  members: unknown[] | null;
  popularPosts: unknown[] | null;
  forumPosts: ForumPostType[];
  collections: CollectionSummary[];
}) {
  const [search] = useQueryState("q", { defaultValue: "" });

  const isSearching = search.length > 0;

  const pluginFuse = useMemo(
    () =>
      new Fuse(allPlugins, {
        keys: [
          { name: "name", weight: 3 },
          { name: "slug", weight: 1.5 },
          { name: "keywords", weight: 1.5 },
          { name: "description", weight: 0.5 },
        ],
        threshold: 0.35,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [allPlugins],
  );

  const filteredPlugins = useMemo(() => {
    if (!isSearching) return featuredPlugins;
    return pluginFuse.search(search).map((r) => r.item);
  }, [search, isSearching, featuredPlugins, pluginFuse]);

  const filteredJobs = useMemo(() => {
    if (!isSearching) return jobs;
    return (jobs ?? []).filter((j) =>
      matchesSearch(search, j.title, j.company?.name),
    );
  }, [search, isSearching, jobs]);

  const [searchedMembers, setSearchedMembers] = useState<any[] | null>(null);

  useEffect(() => {
    if (!isSearching) {
      setSearchedMembers(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/members?q=${encodeURIComponent(search)}`, {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then(({ data }) => setSearchedMembers(data ?? []))
        .catch(() => {});
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, isSearching]);

  const filteredMembers = isSearching ? searchedMembers : members;

  const filteredEvents = useMemo(() => {
    if (!isSearching) return upcomingEvents;
    return upcomingEvents.filter((e) =>
      matchesSearch(
        search,
        e.event.name,
        e.event.geo_address_json?.city,
        e.event.geo_address_json?.country,
      ),
    );
  }, [search, isSearching, upcomingEvents]);

  const filteredPosts = useMemo(() => {
    if (!isSearching) return popularPosts;
    return (popularPosts ?? []).filter((p: any) =>
      matchesSearch(search, p.title, p.content),
    );
  }, [search, isSearching, popularPosts]);

  return (
    <div className="page-shell pb-24 pt-28 md:pt-36">
      <div className="relative mx-auto flex w-full flex-col gap-6">
        <div>
          <HeroTitle totalUsers={totalUsers} />

          <div className="mx-auto mb-20 w-full max-w-[720px]">
            <GlobalSearchInput />
          </div>

          {filteredPlugins.length > 0 && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">
                  {isSearching ? "Plugins" : "Featured Plugins"}
                </h3>
                <Link
                  href={
                    isSearching
                      ? `/plugins?q=${encodeURIComponent(search)}`
                      : "/plugins"
                  }
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>{isSearching ? "See all results" : "View all"}</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredPlugins
                  .slice(0, isSearching ? 12 : 8)
                  .map((plugin) => (
                    <PluginCard key={plugin.slug} plugin={plugin} />
                  ))}
              </div>
            </div>
          )}

          {popularPlugins.length > 0 && !isSearching && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">Popular Plugins</h3>
                <Link
                  href="/plugins?tag=popular"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularPlugins.map((plugin) => (
                  <PluginCard key={plugin.slug} plugin={plugin} />
                ))}
              </div>
            </div>
          )}

          {collections.length > 0 && !isSearching && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">Popular Collections</h3>
                <Link
                  href="/collections"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {collections.slice(0, 4).map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </div>
          )}

          {filteredEvents.length > 0 && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">
                  {isSearching ? "Events" : "Upcoming Events"}
                </h3>
                <Link
                  href={
                    isSearching
                      ? `/events?q=${encodeURIComponent(search)}`
                      : "/events"
                  }
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>{isSearching ? "See all results" : "View all"}</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredEvents
                  .slice(0, isSearching ? 8 : 4)
                  .map((event) => (
                    <EventCard key={event.api_id} data={event} />
                  ))}
              </div>
            </div>
          )}

          {filteredJobs && filteredJobs.length > 0 && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">
                  {isSearching ? "Jobs" : "Featured jobs"}
                </h3>
                <Link
                  href="/jobs"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <JobsFeatured data={filteredJobs} hidePagination={true} />
            </div>
          )}

          {filteredMembers && filteredMembers.length > 0 && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <Link href="/members">
                  <h3 className="section-eyebrow">Members</h3>
                </Link>
                <Link
                  href={
                    isSearching
                      ? `/members?q=${encodeURIComponent(search)}`
                      : "/members"
                  }
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>{isSearching ? "See all results" : "View all"}</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMembers
                  .slice(0, isSearching ? 8 : 4)
                  .map((member) => (
                    // @ts-ignore
                    <MembersCard key={member.id} member={member} gray />
                  ))}
              </div>
            </div>
          )}

          {filteredPosts && filteredPosts.length > 0 && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <Link href="/board">
                  <h3 className="section-eyebrow">
                    Trending in Cursor
                  </h3>
                </Link>
                <Link
                  href="/board"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="space-y-10">
                {filteredPosts.slice(0, 3).map((post) => (
                  // @ts-ignore
                  <BoardPost key={post.post_id} {...post} />
                ))}
              </div>
            </div>
          )}

          {forumPosts.length > 0 && !isSearching && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">From the Forum</h3>
                <a
                  href="https://forum.cursor.com?utm_source=cursor.directory&utm_medium=startpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </a>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "Discussions", href: "https://forum.cursor.com/c/general/4" },
                  { label: "Guides", href: "https://forum.cursor.com/c/guides/20" },
                  { label: "Showcase", href: "https://forum.cursor.com/c/showcase/9" },
                  { label: "Ideas", href: "https://forum.cursor.com/c/ideas/22" },
                  { label: "Announcements", href: "https://forum.cursor.com/c/announcements/11" },
                ].map((cat) => (
                  <a
                    key={cat.label}
                    href={`${cat.href}?utm_source=cursor.directory&utm_medium=startpage`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {cat.label}
                  </a>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {forumPosts.slice(0, 8).map((post) => (
                  <ForumPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {recentPlugins.length > 0 && !isSearching && (
            <div className="mb-14">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="section-eyebrow">Recent Plugins</h3>
                <Link
                  href="/plugins"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>View all</span>
                  <svg
                    width="12"
                    height="13"
                    viewBox="0 0 12 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask
                      id="mask0_106_981"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="12"
                      height="13"
                    >
                      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_106_981)">
                      <path
                        d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
                        fill="currentColor"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentPlugins.slice(0, 16).map((plugin) => (
                  <PluginCard key={plugin.slug} plugin={plugin} />
                ))}
              </div>
            </div>
          )}

          {isSearching &&
            filteredPlugins.length === 0 &&
            filteredEvents.length === 0 &&
            (!filteredJobs || filteredJobs.length === 0) &&
            (!filteredMembers || filteredMembers.length === 0) &&
            (!filteredPosts || filteredPosts.length === 0) && (
              <div className="flex flex-col items-center mt-16">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{search}&quot;
                </p>
                <Link
                  href={`/plugins?q=${encodeURIComponent(search)}`}
                  className="mt-2 border-b border-dashed border-input text-sm text-muted-foreground hover:text-foreground"
                >
                  Search all plugins
                </Link>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
