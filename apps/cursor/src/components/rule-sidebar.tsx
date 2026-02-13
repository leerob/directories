import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateNameAbbr, isImageUrl } from "@/lib/utils";
import type { Rule } from "@directories/data/rules";
import Link from "next/link";
import slugify from "slugify";

export function RuleSidebar({ rule }: { rule: Rule }) {
  return (
    <div className="flex flex-col gap-4 w-full xl:w-[400px] mb-6">
      <div className="p-0 w-full">
        <h1 className="text-lg font-medium">{rule.title}</h1>
        <div className="pt-2 pb-4 border-b border-[#2C2C2C] border-dashed flex flex-wrap gap-2">
          {rule.libs.slice(0, 4).map((lib) => (
            <Link
              href={`/rules/${slugify(lib, { lower: true })}`}
              key={lib}
              className="bg-[#1D1D1D] rounded-full font-mono text-xs px-2 py-1"
            >
              <span className="text-[10px] text-[#878787] font-mono flex-shrink-0 block">
                {lib}
              </span>
            </Link>
          ))}
        </div>
        <div className="flex flex-row gap-2 items-center mt-4 mb-2">
          {rule.author?.url && (
            <Avatar className="size-6">
              {rule.author.avatar && isImageUrl(rule.author.avatar) ? (
                <AvatarImage src={rule.author.avatar} alt={rule.author.name} />
              ) : (
                <AvatarFallback>
                  {generateNameAbbr(rule.author.name)}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <h3 className="text-sm font-medium">{rule.author?.name}</h3>
        </div>
      </div>
    </div>
  );
}
