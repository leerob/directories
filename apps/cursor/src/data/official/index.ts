import { readFileSync } from "node:fs";
import { join } from "node:path";

const readMdFile = (filename: string) => {
  try {
    const filePath = join(process.cwd(), "src/data/official", filename);
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return "";
  }
};

export const officialRules = [
  {
    tags: ["UI", "Components", "Shadcn"],
    libs: [],
    title: "Shadcn",
    slug: "shadcn-ui",
    content: readMdFile("./shadcn.md"),
    author: {
      name: "shadcn",
      url: "https://x.com/shadcn",
      avatar:
        "https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg",
    },
  },
  {
    tags: ["Expo", "React Native"],
    libs: [],
    title: "Expo",
    slug: "expo",
    content: readMdFile("./expo.md"),
    author: {
      name: "Expo",
      url: "https://x.com/expo",
      avatar:
        "https://pbs.twimg.com/profile_images/1676741952014897152/j5t0mY_I_400x400.jpg",
    },
  },
  {
    tags: ["tRPC", "React", "Typescript"],
    libs: [],
    title: "tRPC",
    slug: "official/trpc",
    content: readMdFile("./trpc.md"),
    author: {
      name: "tRPC",
      url: "https://x.com/trpc",
      avatar:
        "https://pbs.twimg.com/profile_images/1562943276142960640/8Fo_MxSb_400x400.jpg",
    },
  },
  // {
  //   tags: ["Next.js", "React", "Typescript"],
  //   libs: [],
  //   title: "Next.js",
  //   slug: "nextjs",
  //   content: readMdFile("./nextjs.md"),
  //   author: {
  //     name: "Next.js",
  //     url: "https://x.com/nextjs",
  //     avatar:
  //       "https://pbs.twimg.com/profile_images/1565710214019444737/if82cpbS_400x400.jpg",
  //   },
  // },
  {
    tags: ["Hono", "API", "Typescript"],
    libs: [],
    title: "Hono",
    slug: "hono",
    content: readMdFile("./hono.md"),
    author: {
      name: "Hono",
      url: "https://x.com/honojs",
      avatar:
        "https://pbs.twimg.com/profile_images/1562960963359293446/rGjvMLR1_400x400.jpg",
    },
  },
  {
    tags: ["Resend", "Typescript"],
    libs: [],
    title: "Resend - Typescript",
    slug: "resend-typescript",
    content: readMdFile("./resend.md"),
    author: {
      name: "Resend",
      url: "https://x.com/resend",
      avatar:
        "https://pbs.twimg.com/profile_images/1749861436074151936/MPN32ysD_400x400.jpg",
    },
  },
  {
    tags: ["Supabase"],
    libs: [],
    title: "Supabase - Typescript",
    slug: "official/supabase-typescript",
    content: readMdFile("./supabase.md"),
    author: {
      name: "Supabase",
      url: "https://x.com/supabase",
      avatar:
        "https://pbs.twimg.com/profile_images/1822981431586439168/7xkKXRGQ_400x400.jpg",
    },
  },
  {
    tags: ["Trigger.dev"],
    libs: [],
    title: "Trigger.dev - Typescript",
    slug: "official/trigger-typescript",
    content: readMdFile("./trigger.md"),
    author: {
      name: "Trigger.dev",
      url: "https://x.com/triggerdotdev",
      avatar:
        "https://pbs.twimg.com/profile_images/1808152343872933889/0lQ01rz5_400x400.jpg",
    },
  },
  {
    tags: ["Vercel"],
    libs: [],
    title: "Vercel - Typescript",
    slug: "vercel-typescript",
    content: readMdFile("./vercel.md"),
    author: {
      name: "Vercel",
      url: "https://x.com/vercel",
      avatar:
        "https://pbs.twimg.com/profile_images/1767351110228918272/3Pndc5OT_400x400.png",
    },
  },
  {
    tags: ["Polar"],
    libs: [],
    title: "Polar - Typescript",
    slug: "polar-typescript",
    content: readMdFile("./polar.md"),
    author: {
      name: "Polar",
      url: "https://x.com/polar_sh",
      avatar:
        "https://pbs.twimg.com/profile_images/1830928297477185538/uKJNKdTI_400x400.jpg",
    },
  },
  {
    tags: ["Nuxt"],
    libs: [],
    title: "Nuxt - Typescript",
    slug: "nuxt-typescript",
    content: readMdFile("./nuxt.md"),
    author: {
      name: "Nuxt",
      url: "https://x.com/nuxt_js",
      avatar:
        "https://pbs.twimg.com/profile_images/1696835964881002498/0YEYRNGF_400x400.png",
    },
  },
];

export const officialRulesSections = [
  {
    tag: "Official",
    slug: "official",
    rules: officialRules.filter(
      (rule) =>
        rule.content &&
        rule.content.trim() !== "# Content coming soon" &&
        rule.content.trim() !== "",
    ),
  },
];

export function getOfficialRuleBySlug(slug: string) {
  return officialRules.find((rule) => rule.slug === `official/${slug}`);
}
