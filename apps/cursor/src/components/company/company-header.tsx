import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteCompanyButton } from "./delete-company-button";
import { EditCompanyModal } from "../modals/edit-company-modal";

export function CompanyHeader({
  id,
  image,
  name,
  location,
  isOwner,
  bio,
  website,
  social_x_link,
  is_public,
  slug,
}: {
  id: string;
  image?: string | null;
  name: string;
  location: string | null;
  isOwner: boolean;
  bio?: string | null;
  website?: string | null;
  social_x_link?: string | null;
  is_public?: boolean;
  slug: string;
}) {
  return (
    <div className="relative z-10 mt-4 flex flex-col gap-4 pb-2 md:mt-5 md:flex-row md:items-center md:gap-6">
      <Avatar className="size-20 border border-border bg-card md:size-24">
        <AvatarImage src={image ?? undefined} className="object-cover" />
        <AvatarFallback className="bg-muted text-lg font-medium text-foreground">
          {name?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2 md:pb-1">
        <div className="space-y-1">
          <h2 className="text-[26px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[34px]">
            {name}
          </h2>
          {location && (
            <span className="block text-sm text-muted-foreground">
              {location}
            </span>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="flex self-start gap-2 md:ml-auto md:self-center">
          <DeleteCompanyButton id={id} slug={slug} />
          <EditCompanyModal
            data={{
              id,
              image: image ?? undefined,
              location: location ?? undefined,
              name,
              bio: bio ?? undefined,
              website: website ?? undefined,
              social_x_link: social_x_link ?? undefined,
              is_public,
              slug,
            }}
          />
        </div>
      )}
    </div>
  );
}
