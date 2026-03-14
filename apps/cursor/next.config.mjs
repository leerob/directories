/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/plugins": ["../../plugins/**/*"],
    "/plugins/[slug]": ["../../plugins/**/*"],
    "/": ["../../plugins/**/*"],
    "/sitemap.xml": ["../../plugins/**/*"],
  },
  redirects: async () => {
    return [
      {
        source: "/popular",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/rules",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/rules/:path*",
        destination: "/plugins/:path*",
        permanent: true,
      },
      {
        source: "/mcp",
        destination: "/plugins",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.brandfetch.io",
      },
      {
        hostname: "pbs.twimg.com",
      },
      {
        hostname: "midday.ai",
      },
      {
        hostname: "pub-abe1cd4008f5412abb77357f87d7d7bb.r2.dev",
      },
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "knhgkaawjfqqwmsgmxns.supabase.co",
      },
      {
        hostname: "console.settlemint.com",
      },
      {
        hostname: "assets.serverless-extras.com",
      },
    ],
  },
};

export default nextConfig;
