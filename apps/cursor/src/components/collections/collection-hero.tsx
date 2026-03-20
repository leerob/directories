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
  updatedAt,
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
  updatedAt: string;
}) {
  const logos = dedupeCollectionLogos(items, 5);

  return (
    <div className="space-y-6">
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

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        <span className="text-border">·</span>
        <span>{followerCount} {followerCount === 1 ? "follower" : "followers"}</span>
        <span className="text-border">·</span>
        <span>
          Updated{" "}
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
      </div>

      {logos.length > 0 && (
        <div className="flex items-center gap-3">
          {logos.map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="flex size-12 items-center justify-center rounded-[14px] border border-border bg-card p-2"
            >
              <img
                src={logo}
                alt=""
                className="max-h-8 max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
