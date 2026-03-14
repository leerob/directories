import { getCompanies, getMCPs } from "@/data/queries";
import { getPlugins } from "@directories/data/plugins";
import type { MetadataRoute } from "next";

const BASE_URL = "https://cursor.directory";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/plugins`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const filePlugins = getPlugins();
  for (const plugin of filePlugins) {
    routes.push({
      url: `${BASE_URL}/plugins/${plugin.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const { data: mcpData } = await getMCPs({ fetchAll: true });
  if (mcpData) {
    for (const mcp of mcpData) {
      routes.push({
        url: `${BASE_URL}/plugins/mcp-${mcp.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  const { data: companyData } = await getCompanies();
  if (companyData) {
    for (const company of companyData) {
      routes.push({
        url: `${BASE_URL}/companies/${company.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return routes;
}
