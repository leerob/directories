import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCount } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PluginIconFallback } from "./plugin-icon";
import { VerifiedBadge } from "./verified-badge";

export type PluginCardData = {
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  type: "rules" | "mcp" | "both";
  rulesCount?: number;
  mcpCount?: number;
  keywords?: string[];
  installCount?: number;
  verified?: boolean;
  unpublished?: boolean;
  href: string;
};

const isSvgLogo = (url: string) => url.endsWith(".svg");

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function PluginCard({ plugin }: { plugin: PluginCardData }) {
  return (
    <Link href={plugin.href}>
      <Card className="h-[156px] overflow-hidden border-border bg-transparent transition-colors hover:border-input hover:bg-transparent">
        <CardContent className="flex flex-col gap-3 p-4 h-full">
          <div className="flex items-center gap-3">
            {isValidImageUrl(plugin.logo) ? (
              <Avatar className="size-9 rounded-[4px] flex-shrink-0 border border-border bg-muted">
                <AvatarImage
                  src={plugin.logo}
                  alt={plugin.name}
                  className={cn(
                    "object-cover",
                    isSvgLogo(plugin.logo) && "invert",
                  )}
                />
                <AvatarFallback className="rounded-[4px] bg-muted text-xs text-foreground">
                  {plugin.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <PluginIconFallback size={36} />
            )}
            <h3 className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium tracking-[0.005em] text-foreground">
              <span className="truncate">{plugin.name}</span>
              {plugin.verified && <VerifiedBadge size="sm" />}
              {plugin.unpublished && (
                <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                  Unpublished
                </span>
              )}
            </h3>
          </div>

          <p className="flex-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
            {plugin.description}
          </p>

          <div className="mt-auto flex items-center gap-2">
            {plugin.type === "mcp" || plugin.type === "both" ? (
              <span className="rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                MCP
              </span>
            ) : null}
            {(plugin.type === "rules" || plugin.type === "both") &&
            plugin.rulesCount ? (
              <span className="rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {plugin.rulesCount} {plugin.rulesCount === 1 ? "rule" : "rules"}
              </span>
            ) : null}
            {plugin.installCount ? (
              <span className="ml-auto rounded-[4px] border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                {formatCount(plugin.installCount)}{" "}
                {plugin.installCount === 1 ? "install" : "installs"}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
