"use client";

import ActionButtons from "./ActionButtons";
import RightActions from "./RightActions";
import { toast } from "sonner";

interface PostActionsProps {
  slug: string;
  title: string;
  postId: string;
  likes: number;
  comments: number;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
}

export default function PostActions({
  slug,
  title,
  postId,
  likes,
  comments,
  initialIsLiked = false,
  initialIsBookmarked = false,
}: PostActionsProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${slug}`
      : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const handleShare = (platform: string) => {
    let url = "";
    const text = encodeURIComponent(title);
    const link = encodeURIComponent(shareUrl);

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${text} ${link}`;
        break;
    }

    if (url) window.open(url, "_blank");
  };

  return (
    <>
      {/* Desktop Static Bar */}
      <div className="hidden w-full border-y border-border py-3 lg:flex! lg:items-center! lg:justify-between!">
        <div className="flex items-center gap-6">
          <ActionButtons
            postId={postId}
            likes={likes}
            comments={comments}
            initialIsLiked={initialIsLiked}
          />
        </div>
        <div className="flex items-center gap-2">
          <RightActions
            postId={postId}
            onCopyLink={handleCopyLink}
            onShare={handleShare}
            initialIsBookmarked={initialIsBookmarked}
          />
        </div>
      </div>

      {/* Mobile Floating Bar */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border/40 bg-background/80 px-6 py-2 shadow-xl backdrop-blur-xl lg:hidden! supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 border-r border-border pr-4">
          <ActionButtons
            postId={postId}
            likes={likes}
            comments={comments}
            initialIsLiked={initialIsLiked}
          />
        </div>
        <div className="flex items-center gap-2">
          <RightActions
            postId={postId}
            onCopyLink={handleCopyLink}
            onShare={handleShare}
            initialIsBookmarked={initialIsBookmarked}
          />
        </div>
      </div>
    </>
  );
}
