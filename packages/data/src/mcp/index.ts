import { getPlugins } from "../plugins";

export type MCP = {
  name: string;
  url: string;
  description: string;
  logo?: string;
};

const mcps: MCP[] = getPlugins()
  .filter((plugin) => plugin.hasMcp)
  .map((plugin) => ({
    name:
      plugin.mcpServers[0]?.metadata?.name ??
      plugin.name.replace(/^mcp-/, "").replace(/-/g, " "),
    url:
      plugin.mcpServers[0]?.metadata?.homepage ??
      plugin.homepage ??
      `/plugins/${plugin.slug}`,
    description:
      plugin.mcpServers[0]?.metadata?.description ?? plugin.description,
    logo: plugin.logo,
  }));

export default mcps;
