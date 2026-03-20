"use client";

import { toggleCollectionFollowAction } from "@/actions/toggle-collection-follow";
import { cn, formatCount } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { isAuthenticated as isAuthenticatedClient } from "@/utils/supabase/client-session";
import { Users } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { SignInModal } from "../modals/sign-in-modal";

type Props = {
  collectionId: string;
  ownerSlug: string;
  collectionSlug: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
};

export function CollectionFollowButton({
  collectionId,
  ownerSlug,
  collectionSlug,
  initialIsFollowing,
  initialFollowerCount,
}: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const followAction = useAction(toggleCollectionFollowAction, {
    onError: () => {
      setIsFollowing((prev) => !prev);
      setFollowerCount(initialFollowerCount);
    },
  });

  useEffect(() => {
    setIsAuthenticated(isAuthenticatedClient());
  }, []);

  useEffect(() => {
    setFollowerCount(initialFollowerCount);
  }, [initialFollowerCount]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsFollowing(initialIsFollowing);
        return;
      }

      supabase
        .from("collection_follows")
        .select("collection_id")
        .eq("collection_id", collectionId)
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          setIsFollowing(!!data);
        });
    });
  }, [collectionId, initialIsFollowing]);

  const handleClick = () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }

    const willFollow = !isFollowing;
    setIsFollowing(willFollow);
    setFollowerCount((prev) => prev + (willFollow ? 1 : -1));
    followAction.execute({
      collectionId,
      ownerSlug,
      collectionSlug,
      action: isFollowing ? "unfollow" : "follow",
    });
  };

  return (
    <>
      <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <Users className="size-3.5" />
        <span>{formatCount(followerCount)}</span>
      </span>

      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          isFollowing && "text-foreground",
        )}
        onClick={handleClick}
        disabled={followAction.isExecuting}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>

      <SignInModal
        redirectTo={`/u/${ownerSlug}/collections/${collectionSlug}`}
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />
    </>
  );
}
