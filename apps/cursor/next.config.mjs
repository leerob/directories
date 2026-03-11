/** @type {import('next').NextConfig} */
const nextConfig = {
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
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/mcp",
        destination: "/plugins",
        permanent: true,
      },
      {
        source: "/mcp/:slug",
        destination: "/plugins/mcp-:slug",
        permanent: true,
      },
      {
        source: "/mcp/:slug/:path*",
        destination: "/plugins/mcp-:slug",
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
