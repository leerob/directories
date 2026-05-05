export const aethexRules = [
  {
    tags: [
      "AeThex",
      "TypeScript",
      "Node.js",
      "Express",
      "Supabase",
      "Stripe",
      "Discord",
      "React",
    ],
    title: "AeThex OS Toolkit",
    slug: "aethex-os-toolkit",
    libs: [
      "@aethex.os/supabase",
      "@aethex.os/stripe",
      "@aethex.os/discord",
      "@aethex.os/ai",
      "@aethex.os/passport",
      "@aethex.os/registry",
      "@aethex.os/middleware",
    ],
    content: `# AeThex Stack

## Stack overview
This project uses the \`@aethex.os\` toolkit — a TypeScript-first monorepo of focused packages for auth, payments, AI, feature gating, and game development.

## Authentication & identity
- Use \`@aethex.os/supabase\` for Supabase client creation and Express auth middleware
  - \`createAdminClient(config)\` — service role client (bypasses RLS)
  - \`createUserClient(config, token)\` — user-scoped client (respects RLS)
  - \`requireAuth(config)\` — Express middleware, attaches req.user
- Use \`@aethex.os/passport\` for multi-provider OAuth federation
  - \`createPassportManager({ storage })\` — main manager
  - \`passport.federateOAuthUser(provider, user)\` — login/signup via any OAuth provider
- Use \`@aethex.os/discord\` for Discord-specific OAuth and Activity auth

## Payments
- Use \`@aethex.os/stripe\` for all Stripe operations
  - \`createCheckoutSession(stripe, opts)\` — create Stripe Checkout
  - \`handleSubscriptionEvent(stripe, event, handlers)\` — process webhooks
  - Never use \`stripe.checkout.sessions.create\` directly — always use the wrapper

## AI
- Use \`@aethex.os/ai\` for Gemini AI
  - \`createAiClient({ apiKey, model })\` — create client
  - \`ai.chat(prompt, { history, tools, toolHandler })\` — send message with optional tool use
  - \`createAiChatHandler({ client })\` — drop-in Express route handler

## Feature gating
- Use \`@aethex.os/registry\` for plan-based feature flags
  - Never check \`user.plan === "pro"\` directly — always use \`registry.can(plan, feature)\`
  - In React: use \`<Gate feature="...">\` or \`useFeature("...")\`

## Express middleware
- Use \`@aethex.os/middleware\` for auth guards
  - \`requireAuth()\` for protected routes
  - \`requireAdmin\` for admin-only routes
  - \`createCorsOptions(config)\` for CORS — never raw cors config

## Code conventions
- All API routes must validate auth first
- Webhook handlers must verify signatures before processing (use \`constructWebhookEvent\`)
- Never hardcode Stripe price IDs — read from environment variables
- Feature checks belong in one place: the \`Registry\` instance

## Environment variables
\`\`\`
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
GEMINI_API_KEY=
\`\`\``,
    author: {
      name: "AeThex Corporation",
      url: "https://aethex.dev",
      avatar: "",
    },
  },
];
