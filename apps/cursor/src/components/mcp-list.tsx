import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import slugify from "slugify";
import type { MCP } from "./mcps/mcps-featured";

export default function MCPList({ data }: { data?: MCP[] | null }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-regular">Featured MCPs</h3>
        <Link
          href="/mcp"
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
      <div className="overflow-x-auto hide-scrollbar">
        <motion.div
          className="flex gap-2 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.2,
            staggerChildren: 0.05,
          }}
        >
          {data?.map((mcp, index) => (
            <motion.div
              key={mcp.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <Link
                href={`/mcp/${mcp.slug || slugify(mcp.name, { lower: true })}`}
                className="px-6 py-2 text-sm rounded-full font-medium whitespace-nowrap flex items-center gap-2 border border-border"
              >
                {mcp.logo && (
                  <Image
                    src={mcp.logo}
                    alt={`${mcp.name} logo`}
                    width={16}
                    height={16}
                  />
                )}
                <span className="pr-4">{mcp.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
