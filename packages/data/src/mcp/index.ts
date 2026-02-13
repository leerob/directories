export type MCP = {
  name: string;
  url: string;
  description: string;
  logo?: string;
};

export default [
  {
    name: "Upstash",
    url: "https://github.com/upstash/mcp-server",
    description:
      "Model Context Protocol (MCP) is a new, standardized protocol for managing context between large language models (LLMs) and external systems. In this repository, we provide an installer as well as an MCP Server for Upstash Developer API's.",
    logo: "https://avatars.githubusercontent.com/u/74989412?s=200&v=4",
  },
  {
    name: "Github",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    description:
      "This server provides integration with Github's issue tracking system through MCP, allowing LLMs to interact with Github issues.",
    logo: "https://cdn.brandfetch.io/idZAyF9rlg/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Resend",
    url: "https://github.com/resend/mcp-send-email",
    description:
      "This is a simple MCP server that sends emails using Resend's API. Why? Now you can let Cursor or Claude Desktop compose emails for you and send it right away without having to copy and paste the email content.",
    logo: "https://pbs.twimg.com/profile_images/1749861436074151936/MPN32ysD_400x400.jpg",
  },
  {
    name: "PostgreSQL",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    description:
      "A Model Context Protocol server that provides read-only access to PostgreSQL databases. This server enables LLMs to inspect database schemas and execute read-only queries.",
    logo: "https://cdn.brandfetch.io/idjSeCeMle/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Supabase",
    url: "https://github.com/supabase-community/mcp-supabase/tree/main/packages/mcp-server-postgrest",
    description:
      "This is an MCP server for PostgREST. It allows LLMs perform database queries and operations on Postgres databases via PostgREST.",
    logo: "https://cdn.brandfetch.io/idsSceG8fK/w/436/h/449/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Prisma",
    url: "https://github.com/prisma/mcp",
    description:
      "Gives LLMs the ability to manage Prisma Postgres databases (e.g. spin up new databases and run migrations or queries)",
    logo: "https://cdn.brandfetch.io/idBBE3_R9e/idI_xi9A1U.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Vercel",
    url: "https://github.com/nganiet/mcp-vercel",
    description:
      "Integrates with Vercel's serverless infrastructure to provide a lightweight endpoint for AI model interactions and tasks like chatbots, content generation, and data analysis.",
    logo: "https://cdn.brandfetch.io/idDpCfN4VD/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Convex",
    url: "https://docs.convex.dev/ai/using-cursor#setup-the-convex-mcp-server",
    description:
      "Cursor, the AI code editor, makes it easy to write and maintain apps built with Convex. Let's walk through how to setup Cursor for the best possible results with Convex.",
    logo: "https://pbs.twimg.com/profile_images/1886599096636694528/0Y8VYt94_400x400.png",
  },
  {
    name: "Figma",
    url: "https://github.com/GLips/Figma-Context-MCP",
    description:
      "Proivde coding agents with design data direct from Figma for far more accurate design implementations in one-shot.",
    logo: "https://cdn.brandfetch.io/idZHcZ_i7F/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Sentry",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry",
    description:
      "A Model Context Protocol server for retrieving and analyzing issues from Sentry.io. This server provides tools to inspect error reports, stacktraces, and other debugging information from your Sentry account.",
    logo: "https://cdn.brandfetch.io/idag_928SW/theme/light/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Neon",
    url: "https://github.com/neondatabase/mcp-server-neon",
    description: "Interact with the Neon serverless Postgres platform",
    logo: "https://pbs.twimg.com/profile_images/1658763245325254659/1o0WFQns_400x400.jpg",
  },
  {
    name: "Tinybird",
    url: "https://github.com/tinybirdco/mcp-tinybird",
    description: "Interface with the Tinybird serverless ClickHouse platform",
    logo: "https://pbs.twimg.com/profile_images/1876354325951217664/pDcUAeY2_400x400.png",
  },
  {
    name: "Stripe",
    url: "https://github.com/stripe/agent-toolkit/tree/main/modelcontextprotocol",
    description: "Interact with the Stripe API",
    logo: "https://cdn.brandfetch.io/idxAg10C0L/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Axiom",
    url: "https://github.com/axiomhq/mcp-server-axiom",
    description:
      "Query and analyze logs, traces, and event data using natural language",
    logo: "https://cdn.brandfetch.io/ids3R5NX-p/theme/light/logo.svg",
  },
  {
    name: "Slack",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    description:
      "MCP Server for the Slack API, enabling Claude to interact with Slack workspaces.",
    logo: "https://cdn.brandfetch.io/idJ_HhtG0Z/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Browserbase",
    url: "https://github.com/browserbase/mcp-server-browserbase",
    description: "Automate browser interactions in the cloud",
  },
  {
    name: "Cloudflare",
    url: "https://github.com/cloudflare/mcp-server-cloudflare",
    description:
      "Deploy and manage resources on the Cloudflare developer platform",
    logo: "https://cdn.brandfetch.io/idJ3Cg8ymG/idASSo3XVu.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "E2B",
    url: "https://github.com/e2b-dev/mcp-server",
    description: "Execute code in secure cloud sandboxes",
    logo: "https://cdn.brandfetch.io/id8E4Bu5Zl/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Obsidian Markdown Notes",
    url: "https://github.com/calclavia/mcp-obsidian",
    description: "Read and search through Markdown notes in Obsidian vaults",
    logo: "https://cdn.brandfetch.io/idGpyxH_Fa/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Qdrant",
    url: "https://github.com/qdrant/mcp-server-qdrant/",
    description:
      "Implement semantic memory using the Qdrant vector search engine",
  },
  {
    name: "Raygun",
    url: "https://github.com/MindscapeHQ/mcp-server-raygun",
    description: "Access crash reporting and monitoring data",
    logo: "https://cdn.brandfetch.io/idXlCTTXd-/theme/dark/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B",
  },
  {
    name: "Search1API",
    url: "https://github.com/fatwang2/search1api-mcp",
    description: "Unified API for search, crawling, and sitemaps",
  },
  {
    name: "Logseq MCP Tools",
    description: "A Model Context Protocol (MCP) server that provides AI assistants with structured access to your Logseq knowledge graph.",
    url: "https://github.com/joelhooks/logseq-mcp-tools",
  },
  {
    name: "Docker",
    url: "https://github.com/ckreiling/mcp-server-docker",
    description: "Manage containers, images, volumes, and networks",
  },
  {
    name: "Kubernetes",
    url: "https://github.com/Flux159/mcp-server-kubernetes",
    description: "Manage pods, deployments, and services",
  },
  {
    name: "Snowflake",
    url: "https://github.com/datawiz168/mcp-snowflake-service",
    description: "Interact with Snowflake databases",
  },
  {
    name: "Todoist",
    url: "https://github.com/abhiz123/todoist-mcp-server",
    description: "Task management integration",
  },
  {
    name: "Brave Search",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    description: "Web and local search using Brave's Search API",
  },
  {
    name: "Fetch",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    description: "Web content fetching and conversion optimized for LLM usage",
  },
  {
    name: "Puppeteer",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    description: "Browser automation and web scraping capabilities",
  },
  {
    name: "Filesystem",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    description: "Secure file operations with configurable access controls",
  },
  {
    name: "SQLite",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite",
    description: "Database interaction and business intelligence features",
  },
  {
    name: "Google Drive",
    url: "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    description: "File access and search capabilities for Google Drive",
  },
  {
    name: "BrowserTools MCP",
    url: "https://github.com/AgentDeskAI/browser-tools-mcp",
    description:
      "Analyze logs & interact with your browser for rapid debugging",
  },
  {
    name: "Firecrawl",
    url: "https://github.com/mendableai/firecrawl-mcp-server",
    description: "Turn entire websites into LLM-ready data",
  },
  {
    name: "Apify RAG Web Browser",
    url: "https://apify.com/apify/rag-web-browser#anthropic-model-context-protocol-mcp-server",
    description:
      "Web browser for LLM apps similar to a web browser in ChatGPT. It queries Google Search, scrapes the top N pages from the results, and returns their cleaned content as Markdown.",
  },
  {
    name: "JSON Resume",
    url: "https://github.com/jsonresume/mcp",
    description:
      "Updates your resume as your code. Will add new skills and projects as you develop.",
  },
  {
    name: "GCP",
    url: "https://github.com/eniayomi/gcp-mcp",
    description:
      "A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with your Google Cloud Platform environment. This allows for natural language querying and management of your GCP resources during conversations.",
    logo: "https://cdn.brandfetch.io/cloud.withgoogle.com/w/400/h/400?c=1idpNUcW3WQIRQBKP82",
  },
  {
    name: "Inbox Zero",
    url: "https://github.com/elie222/inbox-zero",
    description:
      "A Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with your Inbox Zero account. This allows for natural language querying and management of your email during conversations.",
  },
    {
    name: "SettleMint",
    url: "https://console.settlemint.com/documentation/building-with-settlemint/dev-tools/mcp",
    description:
      "Leverage SettleMint's Model Context Protocol server to seamlessly interact with enterprise blockchain infrastructure. Build, deploy, and manage smart contracts through AI-powered assistants, streamlining your blockchain development workflow for maximum efficiency.",
    logo: "https://console.settlemint.com/android-chrome-512x512.png",
  },
  {
    name: "Money",
    url: "https://github.com/Parsons-ai/money-mcp-server",
    description:
      "Personal finance assistant — track transactions, budgets, net worth, and subscriptions via Plaid-connected bank data. Query your finances with natural language.",
    logo: "https://money.parsons.ai/favicon.ico",
  },
];
