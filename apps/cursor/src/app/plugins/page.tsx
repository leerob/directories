import { PluginList } from "@/components/plugins/plugin-list";
import { getPlugins } from "@directories/data/plugins";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Plugins for Cursor",
  description:
    "Browse community plugins for Cursor, including rules and MCP servers.",
};

export const dynamic = "force-static";
export const revalidate = 86400;

export default function Page() {
  const plugins = getPlugins();

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl px-6 py-12 md:mt-16">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl">Plugins</h1>
        <p className="text-sm text-[#878787]">
          Community plugins for Cursor, including reusable rules and MCP server
          integrations.
        </p>
      </div>

      <PluginList plugins={plugins} />
    </div>
  );
}
