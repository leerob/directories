import { redis } from "@directories/kv/redis";
import { getSections } from "../rules";

export async function getPopularRules() {
  const sections = getSections();
  const hasRedisConfig =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  const sectionsWithCounts = await Promise.all(
    sections.map(async (section) => {
      const rulesWithCounts = await Promise.all(
        section.rules.map(async (rule) => {
          const count = hasRedisConfig
            ? await redis.get(`rules:${rule.slug}`)
            : 0;
          return {
            ...rule,
            count: Number(count) || 0,
          };
        }),
      );

      const sortedRules = rulesWithCounts.sort((a, b) => b.count - a.count);
      const totalCount = sortedRules.reduce((sum, rule) => sum + rule.count, 0);

      return {
        ...section,
        rules: sortedRules,
        totalCount,
      };
    }),
  );

  return sectionsWithCounts.sort((a, b) => b.totalCount - a.totalCount);
}
