"use client";

import { toggleCollectionFollowAction } from "@/actions/toggle-collection-follow";
import { createClient } from "@/utils/supabase/client";
import { isAuthenticated as isAuthenticatedClient } from "@/utils/supabase/client-session";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { SignInModal } from "../modals/sign-in-modal";
import { Button } from "../ui/button";

type Props = {
  collectionId: string;
  ownerSlug: string;
  collectionSlug: string;
  initialIsFollowing: boolean;
};

export function CollectionFollowButton({
  collectionId,
  ownerSlug,
  collectionSlug,
  initialIsFollowing,
}: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const followAction = useAction(toggleCollectionFollowAction);
  const supabase = createClient();

  useEffect(() => {
    setIsAuthenticated(isAuthenticatedClient());
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsFollowing(initialIsFollowing);
        return;
      }

      const { data } = await supabase
        .from("collection_follows")
        .select("collection_id")
        .eq("collection_id", collectionId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      setIsFollowing(!!data);
    };

    fetchFollowing();
  }, [collectionId, initialIsFollowing]);

  const handleClick = () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }

    setIsFollowing((prev) => !prev);
    followAction.execute({
      collectionId,
      ownerSlug,
      collectionSlug,
      action: isFollowing ? "unfollow" : "follow",
    });
  };

  return (
    <>
      <Button
        size="lg"
        variant={isFollowing ? "outline" : "default"}
        onClick={handleClick}
        disabled={followAction.isExecuting}
      >
        {isFollowing ? "Following" : "Follow collection"}
      </Button>

      <SignInModal
        redirectTo={`/u/${ownerSlug}/collections/${collectionSlug}`}
        isOpen={isSignInModalOpen}
        setIsOpen={setIsSignInModalOpen}
      />
    </>
  );
}
