import { getPublicCollections } from "@/data/collections";
import { getCompanies, getPlugins } from "@/data/queries";
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
      url: `${BASE_URL}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const { data: plugins } = await getPlugins({ fetchAll: true });
  if (plugins) {
    for (const plugin of plugins) {
      routes.push({
        url: `${BASE_URL}/plugins/${plugin.slug}`,
        lastModified: new Date(plugin.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
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

  const { data: collections } = await getPublicCollections();
  if (collections) {
    for (const collection of collections) {
      routes.push({
        url: `${BASE_URL}/u/${collection.owner.slug}/collections/${collection.slug}`,
        lastModified: new Date(collection.updated_at),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return routes;
}
