import { Menu } from "@/components/menu";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGames } from "@/data/games";
import { getSections } from "@directories/data/rules";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";

export const metadata = {
  title: "Games made with Cursor",
  description: "Explore games made with Cursor, learn how to make your own.",
};

export default function Page() {
  const sections = getSections().map((s) => ({
    tag: s.tag,
    slug: s.slug,
    rulesCount: s.rules.length,
  }));

  return (
    <div className="flex w-full h-full">
      <div className="hidden md:flex mt-12 sticky top-12 h-[calc(100vh-3rem)]">
        <Menu sections={sections} />
      </div>

      <main className="flex-1 p-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 sm:grid-cols-1">
          {getGames().map((game) => (
            <Link
              href={game.external ? game.link : `/games/${game.slug}`}
              key={game.id}
              target={game.external ? "_blank" : undefined}
              rel={game.external ? "noopener noreferrer" : undefined}
            >
              <Card>
                <CardHeader>
                  <img
                    src={game.screenshot}
                    width="100%"
                    height="auto"
                    className="pb-4 aspect-video"
                    loading="lazy"
                    alt={game.name}
                  />
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={game.author.image}
                        className="size-6 rounded-full"
                      />
                      <AvatarFallback className="size-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium uppercase">
                        {game.author.name.charAt(0)}
                        {game.author.name.charAt(1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-[#878787]">
                      {game.author.name}
                    </span>
                  </div>
                  <CardTitle className="text-md font-semibold font-mono pt-2">
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#878787]">
                    {game.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
