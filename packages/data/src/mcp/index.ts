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
    name: "Aikido Security",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/aikido",
    description:
      "Security scanning in your AI coding workflow.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/aikido/icon.svg",
  },
  {
    name: "Airflow",
    url: "https://github.com/astronomer/agents/tree/main/astro-airflow-mcp#airflow-mcp-server",
    description:
      "Manage Apache Airflow DAGs, monitor runs, debug failures, and access Airflow's REST API.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/airflow/icon.svg",
  },
  {
    name: "Airwallex Developer MCP",
    url: "https://www.airwallex.com/docs/developer-tools/ai/developer-mcp",
    description:
      "Tools to search Airwallex docs and interact with the Airwallex sandbox environment while integrating with Airwallex APIs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/airwallex-dev/icon.svg",
  },
  {
    name: "Alpha Vantage",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/alphavantage",
    description:
      "Financial data API for stocks, forex, crypto, and economic indicators.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/alphavantage/icon.svg",
  },
  {
    name: "alphaXiv",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/alphaxiv",
    description:
      "Search ML research papers and analyze PDFs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/alphaxiv/icon.svg",
  },
  {
    name: "Amazon Devices Builder Tools",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/amazon-devices-buildertools",
    description:
      "Context and tools for developing and debugging apps for Amazon Device OS, including Vega OS.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/amazon-devices-buildertools/icon.svg",
  },
  {
    name: "Amplitude",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/amplitude",
    description:
      "Behavior analytics and experimentation platform for product data insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/amplitude/icon.svg",
  },
  {
    name: "Angular",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/angular",
    description:
      "Angular framework documentation and examples.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/angular/icon.svg",
  },
  {
    name: "Apify",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/apify",
    description:
      "Extract data from any website with thousands of scrapers, crawlers, and automations",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/apify/icon.svg",
  },
  {
    name: "Arcade",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/arcade",
    description:
      "Create and manage MCP gateways connecting 100+ integrations.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/arcade/icon.svg",
  },
  {
    name: "Arize AX",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/arize-ax",
    description:
      "LLM tracing and instrumentation guidance.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/arize-ax/icon.svg",
  },
  {
    name: "Astro docs server",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/astro",
    description:
      "This server provides up-to-date access to the official Astro documentation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/astro/icon.svg",
  },
  {
    name: "Atlassian",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/atlassian",
    description:
      "Project management and collaboration tools including Jira and Confluence.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/atlassian/icon.svg",
  },
  {
    name: "Auth0",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/auth0",
    description:
      "Manage Auth0 resources.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/auth0/icon.svg",
  },
  {
    name: "AWS",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/aws",
    description:
      "Access AWS services through natural language.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/aws/icon.svg",
  },
  {
    name: "AWS Documentation",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/aws-documentation",
    description:
      "Access AWS documentation, search, and get recommendations.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/aws-documentation/icon.svg",
  },
  {
    name: "Azure DevOps",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/azure-devops",
    description:
      "Interact with Azure DevOps work items, pull requests, builds, and releases.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/azure-devops/icon.svg",
  },
  {
    name: "Bitly",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/bitly",
    description:
      "URL shortening and link management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/bitly/icon.svg",
  },
  {
    name: "Bitrise",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/bitrise",
    description:
      "Mobile CI/CD and build management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/bitrise/icon.svg",
  },
  {
    name: "Braintrust",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/braintrust",
    description:
      "Access to the documentation, experiments, and logs in Braintrust.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/braintrust/icon.svg",
  },
  {
    name: "Browser Use",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/browser-use",
    description:
      "The Browser Use MCP server provides Cursor agents access to browser-use documentation. This gives AI assistants deep context about the browser-use library when helping you write code.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/browser-use/icon.svg",
  },
  {
    name: "Builder.io",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/builder",
    description:
      "Headless CMS content management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/builder/icon.svg",
  },
  {
    name: "CAP",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/cap",
    description:
      "SAP Cloud Application Programming Model development.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/cap/icon.svg",
  },
  {
    name: "Chakra UI",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/chakra-ui",
    description:
      "Access Chakra UI component library, design tokens, and migration guidance.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/chakra-ui/icon.svg",
  },
  {
    name: "Checkmarx",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/checkmarx",
    description:
      "Application security testing and vulnerability scanning.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/checkmarx/icon.svg",
  },
  {
    name: "Chrome DevTools",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/chrome-devtools",
    description:
      "Debug web pages directly in Chrome with DevTools debugging capabilities and performance insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/chrome-devtools/icon.svg",
  },
  {
    name: "Circleback",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/circleback",
    description:
      "Search meeting notes and transcripts for dev context.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/circleback/icon.svg",
  },
  {
    name: "Clarity",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/clarity",
    description:
      "Microsoft user behavior analytics.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/clarity/icon.svg",
  },
  {
    name: "ClickUp",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/clickup",
    description:
      "Project management and collaboration for teams & agents.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/clickup/icon.svg",
  },
  {
    name: "Cloudinary",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/cloudinary",
    description:
      "Media asset management and transformation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/cloudinary/icon.svg",
  },
  {
    name: "CodeScene",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/codescene",
    description:
      "Code health insights and technical debt analysis.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/codescene/icon.svg",
  },
  {
    name: "CodeSherlock",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/codesherlock",
    description:
      "AI code analysis for security, quality, and compliance checks.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/codesherlock/icon.svg",
  },
  {
    name: "Codve",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/codve",
    description:
      "Logic-based code verification with confidence scores.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/codve/icon.svg",
  },
  {
    name: "ConfigCat",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/configcat",
    description:
      "Feature flag management for teams.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/configcat/icon.svg",
  },
  {
    name: "Context7",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/context7",
    description:
      "Up-to-date code documentation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/context7/icon.svg",
  },
  {
    name: "Coralogix",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/coralogix",
    description:
      "Observability platform for logs, metrics, and traces.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/coralogix/icon.svg",
  },
  {
    name: "CoreStory",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/corestory",
    description:
      "Access PRDs, technical specs, and project context.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/corestory/icon.svg",
  },
  {
    name: "Corridor",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/corridor",
    description:
      "Proactively enforce security guardrails to reduce vulnerabilities.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/corridor/icon.svg",
  },
  {
    name: "Customer.io",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/customer-io",
    description:
      "Manage segments, users, and marketing automation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/customer-io/icon.svg",
  },
  {
    name: "Databend",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/databend",
    description:
      "AI-native cloud data warehouse analytics.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/databend/icon.svg",
  },
  {
    name: "DBHub",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/dbhub",
    description:
      "Universal database connector for MySQL, PostgreSQL, SQL Server.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/dbhub/icon.svg",
  },
  {
    name: "dbt Labs",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/dbt-labs",
    description:
      "dbt CLI, Semantic Layer, and Discovery API.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/dbt-labs/icon.svg",
  },
  {
    name: "Defang",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/defang",
    description:
      "Deploy apps to AWS, GCP, and DigitalOcean from Docker Compose.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/defang/icon.svg",
  },
  {
    name: "DevExpress",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/devexpress",
    description:
      "DevExpress component library documentation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/devexpress/icon.svg",
  },
  {
    name: "Devopness",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/devopness",
    description:
      "DevOps automation for cloud infrastructure.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/devopness/icon.svg",
  },
  {
    name: "DevRev",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/devrev",
    description:
      "Work item management for development teams.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/devrev/icon.svg",
  },
  {
    name: "DryRun Security",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/dryrun",
    description:
      "Security analysis insights and trends.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/dryrun/icon.svg",
  },
  {
    name: "DuckDB",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/duckdb",
    description:
      "In-process SQL OLAP database for local analytics.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/duckdb/icon.svg",
  },
  {
    name: "Dynatrace",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/dynatrace",
    description:
      "Enterprise observability platform for real-time monitoring and AI-powered insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/dynatrace/icon.svg",
  },
  {
    name: "Elasticsearch",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/elasticsearch",
    description:
      "Query logs and data from the ELK stack.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/elasticsearch/icon.svg",
  },
  {
    name: "Embrace",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/embrace",
    description:
      "Mobile app performance monitoring and crash analytics.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/embrace/icon.svg",
  },
  {
    name: "Endor Labs",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/endor-labs",
    description:
      "Security risk insights for code.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/endor-labs/icon.svg",
  },
  {
    name: "Fellow",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/fellow",
    description:
      "AI meeting notes, transcripts, and action items.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/fellow/icon.svg",
  },
  {
    name: "SAP Fiori",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/fiori",
    description:
      "SAP Fiori UI elements and application development.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/fiori/icon.svg",
  },
  {
    name: "Firebase",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/firebase",
    description:
      "Manage Firebase projects, Auth, Firestore, and more.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/firebase/icon.svg",
  },
  {
    name: "Fluid Attacks",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/fluidattacks",
    description:
      "Security vulnerability scanning and analysis.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/fluidattacks/icon.svg",
  },
  {
    name: "GitLab",
    url: "https://docs.gitlab.com/user/gitlab_duo/model_context_protocol/mcp_server/",
    description:
      "DevSecOps platform for code, CI/CD, and security.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/gitlab/icon.svg",
  },
  {
    name: "Glean",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/glean",
    description:
      "Enterprise knowledge search and context.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/glean/icon.svg",
  },
  {
    name: "Graphite",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/graphite",
    description:
      "Create and manage stacked PRs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/graphite/icon.svg",
  },
  {
    name: "GrowthBook",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/growthbook",
    description:
      "Feature flags and A/B testing platform.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/growthbook/icon.svg",
  },
  {
    name: "Harness",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/harness",
    description:
      "CI/CD and software delivery platform.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/harness/icon.svg",
  },
  {
    name: "Heroku",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/heroku",
    description:
      "Manage Heroku apps and resources.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/heroku/icon.svg",
  },
  {
    name: "Hex",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/hex",
    description:
      "Data analytics platform for insights and exploration.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/hex/icon.svg",
  },
  {
    name: "Honeycomb",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/honeycomb",
    description:
      "Query observability data and SLOs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/honeycomb/icon.svg",
  },
  {
    name: "Hugging Face",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/hugging-face",
    description:
      "Access the Hugging Face Hub and Gradio MCP Servers.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/hugging-face/icon.svg",
  },
  {
    name: "incident.io",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/incident-io",
    description:
      "Incident management and alerting.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/incident-io/icon.svg",
  },
  {
    name: "InstantDB",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/instantdb",
    description:
      "Query and manage InstantDB.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/instantdb/icon.svg",
  },
  {
    name: "Jam",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/jam",
    description:
      "Screen recorder with auto context for debugging.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/jam/icon.svg",
  },
  {
    name: "Kernel",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/kernel",
    description:
      "Fast infrastructure for agents to access the internet.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/kernel/icon.svg",
  },
  {
    name: "Kubit",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/kubit",
    description:
      "Analytics platform with natural language queries.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/kubit/icon.svg",
  },
  {
    name: "Kyomi",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/kyomi",
    description:
      "Query data warehouses with natural language and institutional knowledge.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/kyomi/icon.svg",
  },
  {
    name: "LaunchDarkly",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/launchdarkly",
    description:
      "Feature flags as a service.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/launchdarkly/icon.svg",
  },
  {
    name: "Linear",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/linear",
    description:
      "Issue tracking and project management for development teams.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/linear/icon.svg",
  },
  {
    name: "LiveKit",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/livekit",
    description:
      "Real-time communication documentation and examples.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/livekit/icon.svg",
  },
  {
    name: "Luciq",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/luciq",
    description:
      "Query crash reports and observability data from your IDE.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/luciq/icon.svg",
  },
  {
    name: "SAP Mobile Development Kit",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mdk",
    description:
      "SAP Mobile Development Kit tools and templates.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mdk/icon.svg",
  },
  {
    name: "Mercado Libre",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mercado-libre",
    description:
      "Access Mercado Libre docs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mercado-libre/icon.svg",
  },
  {
    name: "Mercado Pago",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mercado-pago",
    description:
      "Access Mercado Pago docs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mercado-pago/icon.svg",
  },
  {
    name: "Mixpanel",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mixpanel",
    description:
      "Product analytics through natural language queries.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mixpanel/icon.svg",
  },
  {
    name: "MongoDB",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mongodb",
    description:
      "Manage MongoDB data and deployments.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mongodb/icon.svg",
  },
  {
    name: "MotherDuck",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/motherduck",
    description:
      "Query and explore MotherDuck cloud databases.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/motherduck/icon.svg",
  },
  {
    name: "MS Learn Docs",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/ms-learn-docs",
    description:
      "Search Microsoft docs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/ms-learn-docs/icon.svg",
  },
  {
    name: "Mux",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/mux",
    description:
      "Video platform for uploads, streaming, and analytics.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/mux/icon.svg",
  },
  {
    name: "Netlify",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/netlify",
    description:
      "Build and deploy web projects.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/netlify/icon.svg",
  },
  {
    name: "Notion",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/notion",
    description:
      "All-in-one workspace for notes, docs, and project management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/notion/icon.svg",
  },
  {
    name: "Octopus Deploy",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/octopus",
    description:
      "Manage deployments, releases, and runbooks.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/octopus/icon.svg",
  },
  {
    name: "Okahu",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/okahu",
    description:
      "Access to traces and debug your AI agent apps",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/okahu/icon.svg",
  },
  {
    name: "OX Security",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/ox",
    description:
      "Security platform for AI agent integration.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/ox/icon.svg",
  },
  {
    name: "PagerDuty",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/pagerduty",
    description:
      "Manage incidents and alerts.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/pagerduty/icon.svg",
  },
  {
    name: "PayPal",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/paypal",
    description:
      "Payment APIs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/paypal/icon.svg",
  },
  {
    name: "Pendo",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/pendo",
    description:
      "Product analytics and user behavior insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/pendo/icon.svg",
  },
  {
    name: "Perplexity",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/perplexity",
    description:
      "AI-powered web search and research.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/perplexity/icon.svg",
  },
  {
    name: "Pipedream",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/pipedream",
    description:
      "Connect to APIs and workflows.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/pipedream/icon.svg",
  },
  {
    name: "Plaid",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/plaid",
    description:
      "Access financial account data.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/plaid/icon.svg",
  },
  {
    name: "Playwright",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/playwright",
    description:
      "End-to-end browser testing.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/playwright/icon.svg",
  },
  {
    name: "PostHog",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/posthog",
    description:
      "Analytics, error tracking, and feature flags.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/posthog/icon.svg",
  },
  {
    name: "Postman",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/postman",
    description:
      "API collaboration and testing.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/postman/icon.svg",
  },
  {
    name: "Railway",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/railway",
    description:
      "Deploy apps, databases, and services.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/railway/icon.svg",
  },
  {
    name: "Ref",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/ref",
    description:
      "Token-efficient documentation search.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/ref/icon.svg",
  },
  {
    name: "Render",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/render",
    description:
      "Manage your Render services.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/render/icon.svg",
  },
  {
    name: "Replicate",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/replicate",
    description:
      "Search, discover, compare, and run AI models with a cloud API.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/replicate/icon.svg",
  },
  {
    name: "SafeDep Vet",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/safedep",
    description:
      "Vet open source packages for security issues.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/safedep/icon.svg",
  },
  {
    name: "Salesforce DX",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/salesforce-dx",
    description:
      "Interact with Salesforce orgs, manage metadata, data, and development workflows.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/salesforce-dx/icon.svg",
  },
  {
    name: "Sanity",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/sanity",
    description:
      "Create, query, and manage Sanity content, releases, datasets, and schemas.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/sanity/icon.svg",
  },
  {
    name: "Scalekit",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/scalekit",
    description:
      "Auth stack for AI applications. Manage environments and connections.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/scalekit/icon.svg",
  },
  {
    name: "Scout APM",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/scout",
    description:
      "Application performance monitoring and insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/scout/icon.svg",
  },
  {
    name: "SearchAPI",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/searchapi",
    description:
      "Real-time search engine API for AI applications.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/searchapi/icon.svg",
  },
  {
    name: "Select Star",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/select-star",
    description:
      "Data catalog, lineage, and context.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/select-star/icon.svg",
  },
  {
    name: "Semgrep",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/semgrep",
    description:
      "Scan code for security vulnerabilities.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/semgrep/icon.svg",
  },
  {
    name: "shadcn/ui",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/shadcn",
    description:
      "Use the shadcn/ui MCP server to browse, search, and install components from registries.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/shadcn/icon.svg",
  },
  {
    name: "Shopify",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/shopify",
    description:
      "Shopify app development tools.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/shopify/icon.svg",
  },
  {
    name: "Shuttle",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/shuttle",
    description:
      "Deploy Rust applications to the cloud.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/shuttle/icon.svg",
  },
  {
    name: "Sidemail",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/sidemail",
    description:
      "Send transactional emails and manage email workflows.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/sidemail/icon.svg",
  },
  {
    name: "Snyk",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/snyk",
    description:
      "Vulnerability scanning of your codebase.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/snyk/icon.svg",
  },
  {
    name: "Socket",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/socket",
    description:
      "Analyze and secure dependencies.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/socket/icon.svg",
  },
  {
    name: "SonarQube",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/sonarqube",
    description:
      "Analyze code with SonarQube.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/sonarqube/icon.svg",
  },
  {
    name: "Stack Overflow",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/stackoverflow",
    description:
      "Access trusted technical Q&A from Stack Overflow.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/stackoverflow/icon.svg",
  },
  {
    name: "Statsig",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/statsig",
    description:
      "Feature flags and experimentation platform.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/statsig/icon.svg",
  },
  {
    name: "Supadata",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/supadata",
    description:
      "Video and web scraping for AI applications.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/supadata/icon.svg",
  },
  {
    name: "Svelte",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/svelte",
    description:
      "Svelte framework documentation and guidance.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/svelte/icon.svg",
  },
  {
    name: "Tauri",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/tauri",
    description:
      "Build and debug Tauri desktop/mobile apps with screenshots and DOM state.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/tauri/icon.svg",
  },
  {
    name: "Tavily",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/tavily",
    description:
      "Build AI applications with real-time web data using Tavily's search, extract, crawl, and research APIs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/tavily/icon.svg",
  },
  {
    name: "Terraform",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/terraform",
    description:
      "Generate and automate Terraform workflows.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/terraform/icon.svg",
  },
  {
    name: "TestDino",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/testdino",
    description:
      "Connect AI tools to testing platform.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/testdino/icon.svg",
  },
  {
    name: "Tigris",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/tigris",
    description:
      "S3-compatible object storage management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/tigris/icon.svg",
  },
  {
    name: "UI5 MCP Server",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/ui5",
    description:
      "OpenUI5 and SAPUI5 web application development.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/ui5/icon.svg",
  },
  {
    name: "Unleash",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/unleash",
    description:
      "Open source feature flags management.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/unleash/icon.svg",
  },
  {
    name: "Uno Platform",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/uno",
    description:
      "Cross-platform .NET application development.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/uno/icon.svg",
  },
  {
    name: "Vale",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/vale",
    description:
      "Style and grammar linting for documentation.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/vale/icon.svg",
  },
  {
    name: "Vantage",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/vantage",
    description:
      "Cloud cost management and FinOps insights.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/vantage/icon.svg",
  },
  {
    name: "Vault",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/vault",
    description:
      "Store and manage secrets.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/vault/icon.svg",
  },
  {
    name: "Webflow",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/webflow",
    description:
      "Webflow's MCP server enhances an agent's understanding of your Webflow projects. It's built on Webflow's APIs, exposing them as tools your AI agent can use to create elements, styles, and variables on the canvas, as well as manage collections, custom code, assets, and other site data.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/webflow/icon.svg",
  },
  {
    name: "Webvizio",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/webvizio",
    description:
      "Bug feedback with screenshots and browser logs.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/webvizio/icon.svg",
  },
  {
    name: "Windsor.ai",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/windsor",
    description:
      "Query analytics data across marketing platforms.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/windsor/icon.svg",
  },
  {
    name: "Wix",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/wix",
    description:
      "Build and manage Wix sites.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/wix/icon.svg",
  },
  {
    name: "WordPress.com",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/wordpress",
    description:
      "Manage WordPress.com sites, posts, and content.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/wordpress/icon.svg",
  },
  {
    name: "You.com",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/you",
    description:
      "AI-powered web search and research.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/you/icon.svg",
  },
  {
    name: "Zapier",
    url: "https://github.com/cursor/mcp-servers/tree/main/servers/zapier",
    description:
      "Automate workflows with 30,000+ actions across 8,000+ apps. Build once, orchestrate everywhere.",
    logo: "https://raw.githubusercontent.com/cursor/mcp-servers/main/servers/zapier/icon.svg",
  },
];
