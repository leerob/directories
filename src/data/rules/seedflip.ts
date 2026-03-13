export const seedflipRules = [
  {
    tags: ["Design", "Design System", "Tailwind", "shadcn", "CSS", "MCP"],
    title: "SeedFlip Design System Generator",
    libs: ["seedflip-mcp"],
    slug: "seedflip-design-system",
    content: `
You have access to the SeedFlip MCP server with 104 curated design seeds. Each seed is a complete design system: fonts, colors, spacing, shadows, border radius.

## When to Use
- User asks for a design system, theme, color palette, or visual direction
- User says "make it look like Stripe/Vercel/Linear" or references a brand
- User wants to set up Tailwind, shadcn/ui, or CSS custom properties
- User is starting a new project and needs design decisions

## MCP Server Setup
Add to your MCP configuration:
\`\`\`json
{
  "mcpServers": {
    "seedflip": {
      "command": "npx",
      "args": ["-y", "seedflip-mcp"]
    }
  }
}
\`\`\`

## Available Tools
- \`get_design_seed(query, format, count)\` — fetch seeds by brand, style, or vibe
  - Formats: tokens, tailwind, css, shadcn
  - Query examples: "Stripe", "dark minimal", "warm editorial blog", "neon cyberpunk"
- \`list_design_seeds(tag)\` — browse all 104 seeds, filter by tag

## Design Principles
- Use the full seed as a coherent system. Don't cherry-pick values across seeds.
- Match the output format to the user's stack (tailwind, css, shadcn, tokens).
- Always include the Google Fonts import URL from the seed response.
- If they don't like it, flip again. There are 104 seeds.

## Brand References
Stripe, Vercel, Linear, GitHub, Notion, Supabase, Spotify, Framer, Resend, Superhuman, Raycast, Arc, Railway, Tailwind

## Style Tags
dark, light, minimal, brutalist, warm, elegant, editorial, neon, cyberpunk, retro, professional, luxury, developer

## Response Style
Keep it short. Lead with the seed name and vibe. The design speaks for itself.
    `,
    author: {
      name: "SeedFlip",
      url: "https://seedflip.co",
      avatar: "https://raw.githubusercontent.com/bockenstette1/seedflip/main/public/social/logo-black-transparent.png",
    },
  },
];
