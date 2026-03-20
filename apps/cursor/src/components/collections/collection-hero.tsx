import { dedupeCollectionLogos } from "@/lib/collections";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type HeroItem = {
  plugin_id: string;
  plugin_logo: string | null;
  entity_type: string;
};

export function CollectionHero({
  title,
  description,
  owner,
  items,
  itemCount,
  followerCount,
  lastActivityAt,
}: {
  title: string;
  description: string | null;
  owner: {
    name: string;
    slug: string;
    image: string | null;
  };
  items: HeroItem[];
  itemCount: number;
  followerCount: number;
  lastActivityAt: string;
}) {
  const logos = dedupeCollectionLogos(items, 6);
  const typeCounts = items.reduce(
    (acc, item) => {
      acc[item.entity_type] = (acc[item.entity_type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const summaryChips = [
    typeCounts.plugin ? `${typeCounts.plugin} plugins` : null,
    typeCounts.mcp_server ? `${typeCounts.mcp_server} MCPs` : null,
    typeCounts.rule ? `${typeCounts.rule} rules` : null,
    typeCounts.skill ? `${typeCounts.skill} skills` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="surface-card overflow-hidden rounded-[28px] border border-border">
      <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_320px] md:p-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Avatar className="size-8 rounded-[8px] border border-border bg-muted">
              <AvatarImage src={owner.image ?? undefined} alt={owner.name} />
              <AvatarFallback className="rounded-[8px] bg-muted text-xs text-foreground">
                {owner.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Link href={`/u/${owner.slug}`} className="hover:text-foreground">
              {owner.name}
            </Link>
          </div>

          <div>
            <h1 className="marketing-page-title text-left">{title}</h1>
            {description && (
              <p className="marketing-copy mt-4 max-w-2xl">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="rounded-full border border-border bg-card px-3 py-1.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </div>
            <div className="rounded-full border border-border bg-card px-3 py-1.5">
              {followerCount} {followerCount === 1 ? "follower" : "followers"}
            </div>
            <div className="rounded-full border border-border bg-card px-3 py-1.5">
              Updated{" "}
              {formatDistanceToNow(new Date(lastActivityAt), {
                addSuffix: true,
              })}
            </div>
          </div>

          {summaryChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summaryChips.map((chip) => (
                <div
                  key={chip}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {chip}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-[220px] overflow-hidden rounded-[24px] border border-border bg-card p-4">
          <div className="grid h-full grid-cols-3 gap-3">
            {logos.length > 0 ? (
              logos.map((logo, index) => (
                <div
                  key={`${logo}-${index}`}
                  className="flex min-h-[72px] items-center justify-center rounded-[18px] border border-border bg-background p-4"
                >
                  <img
                    src={logo}
                    alt=""
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center rounded-[18px] border border-dashed border-border text-sm text-muted-foreground">
                Logos appear from real plugin artwork
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
