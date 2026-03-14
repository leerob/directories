import { CursorDeepLink } from "@/components/cursor-deeplink";
import { MCPsEditButton } from "@/components/mcps/mcps-edit-button";
import { PluginDetail } from "@/components/plugins/plugin-detail";
import { getMCPBySlug, getMCPs } from "@/data/queries";
import { getPluginBySlug, getPlugins } from "@directories/data/plugins";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  const filePlugin = getPluginBySlug(slug);
  if (filePlugin) {
    return {
      title: `${filePlugin.name} | Cursor Directory`,
      description: filePlugin.description,
    };
  }

  if (slug.startsWith("mcp-")) {
    const mcpSlug = slug.replace(/^mcp-/, "");
    const { data: mcp } = await getMCPBySlug(mcpSlug);
    if (mcp) {
      return {
        title: `${mcp.name} - MCP Server | Cursor Directory`,
        description: mcp.description,
      };
    }
  }

  return { title: "Plugin Not Found" };
}

export async function generateStaticParams() {
  const filePlugins = getPlugins().map((p) => ({ slug: p.slug }));
  const { data: mcps } = await getMCPs({ fetchAll: true });
  const mcpParams = (mcps ?? []).map((mcp) => ({ slug: `mcp-${mcp.slug}` }));

  return [...filePlugins, ...mcpParams];
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;

  const filePlugin = getPluginBySlug(slug);
  if (filePlugin) {
    return <PluginDetail plugin={filePlugin} />;
  }

  if (slug.startsWith("mcp-")) {
    const mcpSlug = slug.replace(/^mcp-/, "");
    const { data: mcp } = await getMCPBySlug(mcpSlug);

    if (mcp) {
      return (
        <div className="min-h-screen mt-24 px-4">
          <div className="container px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              {mcp.logo && (
                <Image
                  src={mcp.logo}
                  alt={`${mcp.name} logo`}
                  width={48}
                  height={48}
                  className={mcp.logo.endsWith(".svg") ? "invert" : ""}
                />
              )}
              <div className="flex items-center gap-2 justify-between w-full">
                <h1 className="text-2xl">{mcp.name}</h1>
                <MCPsEditButton ownerId={mcp.owner_id} slug={mcp.slug} />
              </div>
            </div>
            <p className="text-[#878787] mb-4">{mcp.description}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono text-[#878787] border border-border px-2 py-1">
                MCP
              </span>
            </div>

            {mcp.mcp_link ? (
              <CursorDeepLink mcp_link={mcp.mcp_link} />
            ) : (
              <Link
                href={mcp.link}
                className="text-sm text-[#878787] flex items-center gap-1"
                target="_blank"
              >
                <span>Installation Instructions</span>
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
        </div>
      );
    }
  }

  notFound();
}

export const revalidate = 3600;
