import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export type PluginCardData = {
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  type: "rules" | "mcp" | "both";
  rulesCount?: number;
  keywords?: string[];
  href: string;
};

const isSvgLogo = (url: string) => url.endsWith(".svg");

export function PluginCard({ plugin }: { plugin: PluginCardData }) {
  return (
    <Link href={plugin.href}>
      <Card className="bg-transparent h-[140px] hover:bg-accent transition-colors">
        <CardContent className="flex flex-col gap-3 p-4 h-full">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-none flex-shrink-0">
              {plugin.logo ? (
                <AvatarImage
                  src={plugin.logo}
                  alt={plugin.name}
                  className={cn(isSvgLogo(plugin.logo) && "invert")}
                />
              ) : (
                <AvatarFallback className="bg-[#1c1c1c] rounded-none text-xs">
                  {plugin.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <h3 className="text-sm font-medium truncate">{plugin.name}</h3>
          </div>

          <p className="text-[#878787] text-xs line-clamp-2 font-mono flex-1">
            {plugin.description}
          </p>

          <div className="flex items-center gap-2">
            {plugin.type === "mcp" || plugin.type === "both" ? (
              <span className="text-[10px] font-mono text-[#878787] border border-border px-1.5 py-0.5">
                MCP
              </span>
            ) : null}
            {(plugin.type === "rules" || plugin.type === "both") &&
            plugin.rulesCount ? (
              <span className="text-[10px] font-mono text-[#878787] border border-border px-1.5 py-0.5">
                {plugin.rulesCount} {plugin.rulesCount === 1 ? "rule" : "rules"}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
