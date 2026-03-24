"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import HeartIcon from "@/components/ui/heart-icon";
import { MessageSquare } from "lucide-react";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/actions/interactions";

interface ActionButtonsProps {
  postId: string;
  likes: number;
  comments: number;
  initialIsLiked?: boolean;
}

export default function ActionButtons({
  postId,
  likes: initialLikes,
  comments,
  initialIsLiked = false,
}: ActionButtonsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const heartIconRef = useRef<AnimatedIconHandle>(null);

  const handleLike = () => {
    // Optimistic update
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
      heartIconRef.current?.stopAnimation();
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
      heartIconRef.current?.startAnimation();
    }

    // Server action
    startTransition(async () => {
      try {
        await toggleLike(postId);
      } catch {
        // Revert on error
        setLikes(initialLikes);
        setIsLiked(initialIsLiked);
      }
    });
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="group text-muted-foreground hover:bg-transparent hover:text-primary"
          onClick={handleLike}
          disabled={isPending}
        >
          <HeartIcon
            ref={heartIconRef}
            className={cn(
              "h-6 w-6 transition-colors",
              isLiked
                ? "text-red-500"
                : "text-muted-foreground group-hover:text-red-500",
            )}
          />
        </Button>
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isLiked ? "text-red-500" : "text-muted-foreground",
          )}
        >
          {likes > 1000 ? (likes / 1000).toFixed(1) + "K" : likes}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-transparent hover:text-primary"
          onClick={scrollToComments}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {comments}
        </span>
      </div>
    </>
  );
}
