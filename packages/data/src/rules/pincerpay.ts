export const pincerpayRules = [
  {
    title: "PincerPay x402 Payment Gateway Rules",
    tags: ["PincerPay", "x402", "Solana", "Blockchain", "TypeScript", "Payments"],
    slug: "pincerpay-x402-payment-gateway",
    libs: [
      "@pincerpay/merchant",
      "@pincerpay/agent",
      "@pincerpay/core",
      "@x402/core",
      "@x402/svm",
      "@x402/evm",
      "Hono",
      "Express",
      "Drizzle ORM",
    ],
    content: `
You are an expert in PincerPay, an on-chain payment gateway for the agentic economy. You have deep knowledge of the x402 protocol, Solana blockchain, USDC stablecoin payments, and building merchant APIs that AI agents can pay for autonomously.

Key Principles
- Write concise, type-safe TypeScript code using PincerPay SDKs
- Solana is the primary chain; Base and Polygon are optional secondary chains
- All payments settle in USDC on-chain — no card rails, no custodial wallets
- Packages are ESM-only — projects must have "type": "module" in package.json
- Use pnpm as the package manager (monorepo uses pnpm workspaces + Turborepo)

x402 Protocol Flow
- Agent sends HTTP request to merchant API
- Merchant middleware returns HTTP 402 with payment requirements (price, chain, token, facilitator URL)
- Agent signs a USDC transfer transaction
- Agent retries the request with the signed transaction in the X-PAYMENT header
- PincerPay facilitator verifies the signature, broadcasts to the blockchain, and returns the response
- The merchant never touches crypto directly — the middleware handles everything

Merchant SDK (@pincerpay/merchant)
- Use \`pincerpay()\` for Express middleware, \`pincerpayHono()\` for Hono middleware
- Import from subpaths: \`@pincerpay/merchant/express\` or \`@pincerpay/merchant/hono\`
- Configure routes with price, chain, and description:
  \`\`\`typescript
  pincerpay({
    apiKey: process.env.PINCERPAY_API_KEY!,
    merchantAddress: "YOUR_SOLANA_ADDRESS",
    routes: {
      "GET /api/data": { price: "0.01", chain: "solana", description: "Data endpoint" },
    },
  })
  \`\`\`
- Multi-chain routes use \`chains: ["solana", "base"]\` instead of \`chain\`
- The middleware intercepts matching routes and handles 402 challenges automatically
- Always set merchantAddress to a Solana address for Solana-primary routes

Agent SDK (@pincerpay/agent)
- Use \`PincerPayAgent.create()\` — it's async and returns a configured agent
- The agent wraps \`fetch()\` with automatic x402 payment handling:
  \`\`\`typescript
  const agent = await PincerPayAgent.create({
    chains: ["solana"],
    solanaPrivateKey: process.env.AGENT_SOLANA_KEY!,
  });
  const response = await agent.fetch("https://api.example.com/weather");
  \`\`\`
- Spending policies are enforced via \`setPolicy()\` with daily limits and per-transaction caps
- Use \`SolanaSmartAgent\` for Squads SPN smart account support with on-chain spending policies
- \`SolanaSmartAgent.settleDirectly()\` bypasses x402 and settles via the Anchor program

Facilitator Service
- Built with Hono on Node.js, deployed to Railway via Docker
- Handles both Solana (@x402/svm) and EVM (@x402/evm) verification and settlement
- Uses Kora for gasless Solana transactions (agents pay fees in USDC, not SOL)
- Implements optimistic finality: sub-$1 transactions release after mempool broadcast (~200ms)
- Gas passthrough: PincerPay never subsidizes gas — agents pay via USDC

Solana-Specific Patterns
- Use @solana/kit v5 (not @solana/web3.js v1) for Solana interactions
- x402 SVM transactions require exact instruction order: ComputeUnitLimit, ComputeUnitPrice, TransferChecked
- TransferChecked (not plain Transfer) with accounts: [source(w), mint(r), destination(w), authority(s)]
- Kora RPC methods: \`getPayerSigner\` (not \`getFeePayer\`), returns \`{ signer_address, payment_address }\`
- Squads SPN provides session keys — decentralized policy co-signer for agent sub-accounts

Database and Dashboard
- PostgreSQL via Supabase with Drizzle ORM for schema management
- Dashboard is Next.js 15 + Tailwind CSS v4 + Supabase Auth
- RLS is enabled on all tables — Drizzle bypasses RLS via direct connection
- After \`db:push\`, re-enable RLS on all tables (Drizzle recreates without it)

Architecture Patterns
- Monorepo: apps/ (facilitator, dashboard, agent-demo) + packages/ (merchant, agent, core, db, solana, program)
- Protocol stack: Discovery (UCP) -> Trust (AP2) -> Settlement (x402) -> Chain Abstraction
- Double-Lock: x402 payment + AP2 mandate must both validate before facilitator broadcasts
- UCP discovery via \`/.well-known/ucp\` manifest for agent-readable commerce discovery
- Compliance-as-a-Service: OFAC screening + reputation gating at facilitator layer

Security Best Practices
- Never commit private keys or API keys — use environment variables
- SOLANA_PRIVATE_KEY for facilitator, AGENT_SOLANA_KEY for agents
- Validate all payment amounts server-side; never trust client-provided amounts
- The facilitator verifies transaction signatures before broadcasting
- Use spending policies to cap agent spending (daily limits, per-transaction maximums)

Testing
- Use vitest for unit and integration tests
- Tests live in \`src/__tests__/\` directories within each package
- Run \`pnpm test\` for all tests or \`pnpm --filter <package> test\` for individual packages
- The facilitator Docker build must exclude test directories in tsconfig

Common Gotchas
- x402 paymentPayload V2 must include \`accepted\` field with payment requirements — without it, TypeError on \`payload.accepted.scheme\`
- Ed25519 raw private key export fails in Node.js — use \`exportKey("pkcs8")\` and take last 32 bytes
- Next.js standalone output mode is required for monorepo Docker builds
- NEXT_PUBLIC_* vars are build-time only — use server component props for runtime flexibility
- Supabase pooler breaks after password reset (PgBouncer caches old credentials) — use direct connection
- \`postgres\` (postgres.js) needs \`serverExternalPackages: ["postgres"]\` in Next.js config on Vercel
    `,
    author: {
      name: "DS1",
      url: "https://github.com/ds1",
      avatar: "https://avatars.githubusercontent.com/u/7265684?v=4",
    },
  },
];
