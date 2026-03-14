"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Plugin } from "@directories/data/plugins";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function buildRuleDeepLink(name: string, content: string) {
  return `cursor://anysphere.cursor-deeplink/rule?name=${encodeURIComponent(name)}&text=${encodeURIComponent(content)}`;
}

export function PluginDetail({ plugin }: { plugin: Plugin }) {
  const [expandedRule, setExpandedRule] = useState<string | null>(
    plugin.rules[0]?.slug ?? null,
  );

  return (
    <div className="min-h-screen mt-24 px-4">
      <div className="container px-4 py-8 max-w-4xl">
        <div className="flex items-start gap-4 mb-4">
          {plugin.logo && (
            <Image
              src={plugin.logo}
              alt={`${plugin.name} logo`}
              width={48}
              height={48}
              className={`rounded-none mt-1 ${plugin.logo.endsWith(".svg") ? "invert" : ""}`}
            />
          )}
          <div>
            <h1 className="text-2xl">{plugin.name}</h1>
            {plugin.author?.name && (
              <p className="text-sm text-[#878787] mt-1">
                by{" "}
                {plugin.author.url ? (
                  <Link
                    href={plugin.author.url}
                    target="_blank"
                    className="border-b border-border border-dashed"
                  >
                    {plugin.author.name}
                  </Link>
                ) : (
                  plugin.author.name
                )}
              </p>
            )}
          </div>
        </div>

        <p className="text-[#878787] mb-8 max-w-2xl">{plugin.description}</p>

        <div className="flex items-center gap-4 mb-10">
          {plugin.homepage && (
            <Link
              href={plugin.homepage}
              target="_blank"
              className="text-sm text-[#878787] flex items-center gap-1"
            >
              <span>View source</span>
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
          )}
        </div>

        {plugin.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {plugin.keywords.map((kw) => (
              <Link
                key={kw}
                href={`/plugins?q=${encodeURIComponent(kw)}`}
                className="text-xs font-mono text-[#878787] border border-border px-2 py-1 hover:text-foreground hover:border-foreground transition-colors"
              >
                {kw}
              </Link>
            ))}
          </div>
        )}

        {plugin.rules.length > 0 && (
          <div>
            <h2 className="text-sm text-[#878787] mb-4">
              {plugin.rules.length}{" "}
              {plugin.rules.length === 1 ? "rule" : "rules"}
            </h2>
            <div className="space-y-3">
              {plugin.rules.map((rule) => {
                const isExpanded = expandedRule === rule.slug;

                return (
                  <Card key={rule.slug} className="bg-transparent">
                    <CardContent className="p-0">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 text-left"
                        onClick={() =>
                          setExpandedRule(isExpanded ? null : rule.slug)
                        }
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">
                            {rule.title}
                          </h3>
                          {!isExpanded && (
                            <p className="text-xs text-[#878787] mt-1 truncate">
                              {rule.content.slice(0, 120)}
                            </p>
                          )}
                        </div>
                        <ChevronDown
                          className={`size-4 text-[#878787] ml-4 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="bg-card p-4 font-mono text-xs text-[#878787] max-h-96 overflow-y-auto">
                            <code className="block whitespace-pre-wrap">
                              {rule.content}
                            </code>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {rule.author?.name && (
                              <p className="text-xs text-[#878787]">
                                by {rule.author.name}
                              </p>
                            )}
                            <a
                              href={buildRuleDeepLink(rule.slug, rule.content)}
                              className="ml-auto"
                            >
                              <img
                                src="https://cursor.com/deeplink/mcp-install-light.svg"
                                alt="Add rule to Cursor"
                                height="32"
                              />
                            </a>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
