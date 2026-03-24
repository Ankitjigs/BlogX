"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toggleFollow } from "@/actions/user";
import AuthDialog from "@/components/auth/AuthDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFollowContextOptional } from "./FollowContext";

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export default function FollowButton({
  authorId,
  initialIsFollowing,
  className,
  size = "sm",
}: FollowButtonProps) {
  const { isSignedIn } = useUser();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Try to use shared context, fallback to local state
  const followContext = useFollowContextOptional();
  const [localIsFollowing, setLocalIsFollowing] = useState(initialIsFollowing);

  // Determine current state from context or local
  const isFollowing = followContext
    ? (followContext.getFollowState(authorId) ?? initialIsFollowing)
    : localIsFollowing;

  // Sync initial state to context on mount
  useEffect(() => {
    if (followContext && followContext.getFollowState(authorId) === undefined) {
      followContext.setFollowState(authorId, initialIsFollowing);
    }
  }, [followContext, authorId, initialIsFollowing]);

  const setIsFollowing = (value: boolean) => {
    if (followContext) {
      followContext.setFollowState(authorId, value);
    } else {
      setLocalIsFollowing(value);
    }
  };

  const handleFollow = () => {
    if (!isSignedIn) {
      setIsAuthOpen(true);
      return;
    }

    // Optimistic Update
    const newValue = !isFollowing;
    setIsFollowing(newValue);

    startTransition(async () => {
      try {
        const result = await toggleFollow(authorId);
        // Ensure state matches server response in case of mismatch
        setIsFollowing(result.isFollowing);
        toast.success(
          result.isFollowing ? "Following author" : "Unfollowed author",
        );
      } catch (error) {
        // Revert on error
        setIsFollowing(!newValue);
        toast.error("Failed to update follow status", {
          description: String(error),
        });
      }
    });
  };

  return (
    <>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size={size}
        className={cn(
          "rounded-full font-bold transition-all",
          isFollowing &&
            "text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10",
          !isFollowing &&
            "bg-primary text-primary-foreground hover:bg-primary/90",
          className,
        )}
        onClick={handleFollow}
        disabled={isPending}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>

      <AuthDialog
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        triggerLabel="follow this author"
      />
    </>
  );
}
