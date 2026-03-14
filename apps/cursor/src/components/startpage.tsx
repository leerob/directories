"use client";

import type { PluginCardData } from "@/components/plugins/plugin-card";
import { PluginCard } from "@/components/plugins/plugin-card";
import Fuse from "fuse.js";
import { motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { BoardPost } from "./board/board-post";
import { GlobalSearchInput } from "./global-search-input";
import { HeroTitle } from "./hero-title";
import { type Job, JobsFeatured } from "./jobs/jobs-featured";
import { MembersCard } from "./members/members-card";

function matchesSearch(term: string, ...fields: (string | undefined | null)[]) {
  const lower = term.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(lower));
}

export function Startpage({
  featuredPlugins,
  allPlugins,
  recentPlugins,
  jobs,
  totalUsers,
  members,
  popularPosts,
}: {
  featuredPlugins: PluginCardData[];
  allPlugins: PluginCardData[];
  recentPlugins: PluginCardData[];
  jobs?: Job[] | null;
  totalUsers: number;
  members: unknown[] | null;
  popularPosts: unknown[] | null;
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

  const filteredMembers = useMemo(() => {
    if (!isSearching) return members;
    return (members ?? []).filter((m: any) =>
      matchesSearch(search, m.name, m.bio),
    );
  }, [search, isSearching, members]);

  const filteredPosts = useMemo(() => {
    if (!isSearching) return popularPosts;
    return (popularPosts ?? []).filter((p: any) =>
      matchesSearch(search, p.title, p.content),
    );
  }, [search, isSearching, popularPosts]);

  return (
    <div>
      <div className="flex flex-col gap-4 w-full relative mx-auto h-screen">
        <div className="transition-all duration-1000">
          <HeroTitle totalUsers={totalUsers} />

          <div className="max-w-[620px] mx-auto w-full mb-14">
            <GlobalSearchInput />
          </div>

          {filteredPlugins.length > 0 && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-regular">
                  {isSearching ? "Plugins" : "Featured Plugins"}
                </h3>
                <Link
                  href={
                    isSearching
                      ? `/plugins?q=${encodeURIComponent(search)}`
                      : "/plugins"
                  }
                  className="text-sm text-[#878787] flex items-center gap-1"
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
                        fill="#878787"
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
            </motion.div>
          )}

          {filteredJobs && filteredJobs.length > 0 && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-regular">
                  {isSearching ? "Jobs" : "Featured jobs"}
                </h3>
                <Link
                  href="/jobs"
                  className="text-sm text-[#878787] flex items-center gap-1"
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
                        fill="#878787"
                      />
                    </g>
                  </svg>
                </Link>
              </div>
              <JobsFeatured data={filteredJobs} hidePagination={true} />
            </motion.div>
          )}

          {filteredMembers && filteredMembers.length > 0 && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
            >
              <div className="flex justify-between items-center mb-4">
                <Link href="/members">
                  <h3 className="text-base font-regular">Members</h3>
                </Link>
                <Link
                  href="/members"
                  className="text-sm text-[#878787] flex items-center gap-1"
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
                        fill="#878787"
                      />
                    </g>
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMembers.map((member) => (
                  // @ts-ignore
                  <MembersCard key={member.id} member={member} gray />
                ))}
              </div>
            </motion.div>
          )}

          {filteredPosts && filteredPosts.length > 0 && !isSearching && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
            >
              <div className="flex justify-between items-center mb-4">
                <Link href="/board">
                  <h3 className="text-base font-regular">
                    Trending in Cursor
                  </h3>
                </Link>
                <Link
                  href="/board"
                  className="text-sm text-[#878787] flex items-center gap-1"
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
                        fill="#878787"
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
            </motion.div>
          )}

          {recentPlugins.length > 0 && !isSearching && (
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-regular">Recent Plugins</h3>
                <Link
                  href="/plugins"
                  className="text-sm text-[#878787] flex items-center gap-1"
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
                        fill="#878787"
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
            </motion.div>
          )}

          {isSearching &&
            filteredPlugins.length === 0 &&
            (!filteredJobs || filteredJobs.length === 0) &&
            (!filteredMembers || filteredMembers.length === 0) && (
              <div className="flex flex-col items-center mt-16">
                <p className="text-sm text-[#878787]">
                  No results found for &quot;{search}&quot;
                </p>
                <Link
                  href={`/plugins?q=${encodeURIComponent(search)}`}
                  className="text-sm text-[#878787] mt-2 border-b border-border border-dashed"
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
