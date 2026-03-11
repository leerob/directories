import type { Plugin } from "@directories/data/plugins";
import { CopyButton } from "../copy-button";
import { CursorDeepLink } from "../cursor-deeplink";
import { SaveRuleButton } from "../save-rule-button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function truncateContent(content: string, limit = 500) {
  if (content.length <= limit) {
    return content;
  }

  return `${content.slice(0, limit)}...`;
}

export function PluginDetail({ plugin }: { plugin: Plugin }) {
  const primaryMcp = plugin.mcpServers[0];
  const deepLink = primaryMcp?.metadata?.deepLink ?? null;
  const homepage = primaryMcp?.metadata?.homepage ?? plugin.homepage;
  const displayName =
    primaryMcp?.metadata?.name ?? plugin.rules[0]?.title ?? plugin.slug;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12 md:mt-16">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl">{displayName}</h1>

              <span className="rounded-full border border-border px-3 py-1 text-xs text-[#878787]">
                {plugin.rules.length} rule{plugin.rules.length === 1 ? "" : "s"}
              </span>

              {plugin.hasMcp ? (
                <span className="rounded-full border border-border px-3 py-1 text-xs text-[#878787]">
                  MCP
                </span>
              ) : null}
            </div>

            <p className="max-w-3xl text-sm text-[#878787]">
              {plugin.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {plugin.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="text-xs font-mono text-[#878787]"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {plugin.logo ? (
            <img
              src={plugin.logo}
              alt={`${displayName} logo`}
              className="h-12 w-12 shrink-0 rounded-none object-contain"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {deepLink ? <CursorDeepLink mcp_link={deepLink} /> : null}

          {homepage ? (
            <a
              href={homepage}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[#878787]"
            >
              Installation instructions
            </a>
          ) : null}
        </div>
      </div>

      {plugin.hasMcp ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">MCP Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-mono text-[#878787]">
              {JSON.stringify(primaryMcp?.config ?? {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}

      {plugin.rules.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl">Rules</h2>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {plugin.rules.map((rule) => (
              <Card key={rule.slug} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-base">{rule.title}</CardTitle>

                    <div className="flex items-center gap-2">
                      <CopyButton content={rule.content} slug={rule.slug} small />
                      <SaveRuleButton content={rule.content} slug={rule.slug} small />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rule.libs.slice(0, 5).map((lib) => (
                      <span
                        key={lib}
                        className="text-xs font-mono text-[#878787]"
                      >
                        {lib}
                      </span>
                    ))}
                  </div>
                </CardHeader>

                <CardContent>
                  <code className="block whitespace-pre-wrap text-sm text-[#878787]">
                    {truncateContent(rule.content)}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
