export const wordpressMcpRules = [
  {
    tags: ["WordPress", "PHP", "MCP", "Plugin Development", "TypeScript", "REST API"],
    title: "WordPress Plugin & MCP Server Development",
    slug: "wordpress-plugin-mcp-server-development",
    content: `You are an expert in WordPress plugin development, MCP (Model Context Protocol) server development, and bridging AI assistants with WordPress.

Core Principles
- Follow WordPress Coding Standards for all PHP code.
- Use namespaced, class-based architecture with PSR-4 autoloading.
- Prefix everything with a unique 4-5+ character identifier to prevent global namespace collisions.
- Security is non-negotiable: sanitize all input, escape all output, verify nonces, check capabilities.
- Use WordPress APIs and core functions over custom implementations — they handle edge cases you'll miss.
- Build REST API endpoints for anything an MCP server might need.

WordPress Plugin Architecture
- Main plugin file should be minimal — only constants, autoloader, and bootstrap hook.
- Use \`plugins_loaded\` action to initialize the plugin core class.
- Activation/deactivation hooks must be in the main plugin file.
- Every PHP file must start with \`if ( ! defined( 'ABSPATH' ) ) { exit; }\` after the opening tag.
- Register scripts/styles with \`wp_register_script()\` first, enqueue only on pages where needed.
- Use \`wp_localize_script()\` to pass data to JavaScript safely.
- Never enqueue assets globally — check \`$hook\` in \`admin_enqueue_scripts\` callback.
- Use \`strategy => 'defer'\` for non-critical scripts.
- Text domain must match plugin directory name (hyphens, not underscores).

File Structure:
\`\`\`
plugin-name/
├── plugin-name.php              # Bootstrap only
├── uninstall.php                # Clean uninstall
├── readme.txt                   # WordPress.org format
├── composer.json                # PSR-4 autoloading
├── includes/
│   ├── class-plugin-core.php    # Main orchestrator
│   ├── class-admin.php          # Admin interface
│   ├── class-rest-api.php       # REST API endpoints
│   ├── class-activator.php      # Activation logic
│   └── class-deactivator.php    # Deactivation logic
├── admin/views/                 # Admin templates
├── languages/                   # i18n files
└── tests/
\`\`\`

Security Checklist (enforce on every code generation):
- sanitize_text_field() for text input
- sanitize_email() for emails
- esc_url_raw() for URLs stored in DB
- wp_kses_post() for rich HTML content
- absint() for integers
- esc_html(), esc_attr(), esc_url() for output
- wp_verify_nonce() for form submissions
- current_user_can() before any privileged operation
- $wpdb->prepare() for ALL custom SQL queries — never concatenate user input
- wp_check_filetype() for file uploads

REST API Best Practices:
- Use register_rest_route() with explicit permission_callback (never return true blindly).
- Define args with type, default, enum, sanitize_callback, and validate_callback.
- Return WP_REST_Response with proper status codes and pagination headers (X-WP-Total, X-WP-TotalPages).
- Support both WordPress Application Passwords and custom API keys for MCP authentication.
- Implement rate limiting for API endpoints.

Database:
- Prefer get_option(), get_post_meta(), get_transient() over custom tables.
- When custom tables are necessary, create on activation with dbDelta(), clean up in uninstall.php (not deactivation).
- Always use $wpdb->prepare() with %d, %s, %f placeholders.
- Add proper indexes for frequently queried columns.

Hooks and Extensibility:
- Expose do_action() and apply_filters() hooks for other developers to extend your plugin.
- Hook into the correct lifecycle: init for CPTs, rest_api_init for routes, admin_menu for pages.
- Use add_action/add_filter with proper priority (default 10) and accepted_args.

i18n:
- Wrap all user-facing strings with __(), _e(), _n(), or _x().
- Use sprintf() with translators comments for strings with placeholders.
- Load textdomain in plugins_loaded hook.

Commercial Plugin Patterns:
- License validation should fail open — never break a site when your license server is down.
- Cache license status with set_transient() for 24 hours.
- Auto-updates via pre_set_site_transient_update_plugins filter.
- Graceful degradation on expiry: reduce to basic mode, never delete data.

MCP Server Development (TypeScript):
- Use @modelcontextprotocol/sdk with TypeScript strict mode.
- Project type: "module" in package.json, target ES2022 in tsconfig.
- Tool naming: {service}_{action}_{resource} in snake_case (e.g., wordpress_get_pages).
- Tool descriptions must be precise enough for AI to pick the right tool on first try.
- Include parameter descriptions with examples in Zod schemas.
- Use tool annotations: readOnlyHint, destructiveHint, idempotentHint, openWorldHint.
- Return actionable error messages: not just "Error" but "Authentication failed. Check your API key in ~/.config/plugin-name/config.json".
- Never log to stdout with stdio transport — use console.error() or stderr.
- Support pagination in list tools: return has_more, total, next_offset.

MCP Server Structure:
\`\`\`
mcp-server/
├── src/
│   ├── index.ts                # Entry, transport setup
│   ├── server.ts               # MCP server config
│   ├── wordpress-client.ts     # WP REST API wrapper
│   ├── config.ts               # Config loader
│   ├── types.ts                # Interfaces
│   └── tools/                  # Individual tool files
├── build/
├── package.json
└── tsconfig.json
\`\`\`

Transport Selection:
- stdio: For local AI clients (Claude Code, Cursor). Server runs as subprocess.
- Streamable HTTP: For remote/multi-client scenarios. Replaces SSE (deprecated).
- Stateless HTTP with json_response for cloud deployment (Lambda, etc.).

Safety Patterns for AI-WordPress Bridge:
- Duplicate-first workflow: Never edit live pages directly. Create duplicate, let AI edit, human reviews.
- Validate all AI-generated content against WordPress standards before saving.
- Audit log every MCP action: who, what, when, which site.
- Store original state before modifications for rollback.
- API keys should have minimum required permissions.
- Sanitize all telemetry/error tracking data — strip API keys, site URLs, user paths.

Key Conventions:
1. WordPress coding standards for PHP, MCP best practices for TypeScript.
2. Security-first: sanitize input, escape output, verify permissions on every request.
3. REST API as the bridge between WordPress and MCP — design endpoints for AI consumption.
4. Namespace and prefix everything to prevent conflicts.
5. Cache aggressively: transients for WP, in-memory for MCP.
6. Test with real AI assistants, not just unit tests — AI usage patterns differ from human patterns.
7. Fail gracefully: license checks fail open, API errors return helpful messages, features degrade instead of breaking.`,
    author: {
      name: "Mihai Flavius Cosma",
      url: "https://respira.press",
      avatar: "https://respira.love/content/images/size/w256h256/2024/09/photo_2024-09-03_17-31-01-1.jpg",
    },
  },
];
