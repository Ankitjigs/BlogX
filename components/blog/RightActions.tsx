"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bookmark,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Share2,
} from "lucide-react";
import LinkIcon from "@/components/ui/link-icon";
import TwitterXIcon from "@/components/ui/twitter-x-icon";
import FacebookIcon from "@/components/ui/facebook-icon";
import LinkedinIcon from "@/components/ui/linkedin-icon";
import WhatsappIcon from "@/components/ui/whatsapp-icon";
import type {
  AnimatedIconHandle,
  AnimatedIconProps,
} from "@/components/ui/types";
import { toggleBookmark } from "@/actions/interactions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RightActionsProps {
  postId: string;
  onCopyLink: () => void;
  onShare: (platform: string) => void;
  initialIsBookmarked?: boolean;
}

export default function RightActions({
  postId,
  onCopyLink,
  onShare,
  initialIsBookmarked = false,
}: RightActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleBookmark = () => {
    const newState = !isBookmarked;
    setIsBookmarked(newState);

    startTransition(async () => {
      try {
        await toggleBookmark(postId);
        toast.success(
          newState ? "Saved to bookmarks" : "Removed from bookmarks",
        );
      } catch {
        setIsBookmarked(!newState); // Revert on error
        toast.error("Failed to update bookmark");
      }
    });
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handlePlay = () => {
    if ("speechSynthesis" in window) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
        toast.success("Resumed reading");
      } else {
        const content = document.getElementById("content");
        if (content) {
          const text = content.textContent || "";
          window.speechSynthesis.cancel(); // Stop any previous

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
          };
          utterance.onpause = () => setIsPaused(true);
          utterance.onresume = () => setIsPaused(false);

          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
          setIsPaused(false);
          toast.success("Reading article...");
        }
      }
    } else {
      toast.error("Text-to-speech not supported");
    }
  };

  const handlePause = () => {
    if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false); // UI state
      toast.info("Paused reading");
    }
  };

  const handleStop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      toast.info("Stopped reading");
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "hover:text-primary",
          isBookmarked ? "text-primary" : "text-muted-foreground",
        )}
        onClick={handleBookmark}
        disabled={isPending}
      >
        <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
      </Button>

      {isPlaying ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={handlePause}
            title="Pause"
          >
            <PauseCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleStop}
            title="Stop"
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        </>
      ) : isPaused ? (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={handlePlay}
            title="Resume"
          >
            <PlayCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleStop}
            title="Stop"
          >
            <StopCircle className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
          onClick={handlePlay}
          title="Listen"
        >
          <PlayCircle className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop Share */}
      <div className="hidden lg:block!">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <ShareMenuItem
              onClick={onCopyLink}
              icon={LinkIcon}
              label="Copy Link"
            />
            <ShareMenuItem
              onClick={() => onShare("twitter")}
              icon={TwitterXIcon}
              label="Share on X"
            />
            <ShareMenuItem
              onClick={() => onShare("facebook")}
              icon={FacebookIcon}
              label="Share on Facebook"
            />
            <ShareMenuItem
              onClick={() => onShare("linkedin")}
              icon={LinkedinIcon}
              label="Share on LinkedIn"
            />
            <ShareMenuItem
              onClick={() => onShare("whatsapp")}
              icon={WhatsappIcon}
              label="Share on WhatsApp"
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Share */}
      <div className="lg:hidden!">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-[32px] px-6 pb-8 pt-4"
          >
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-muted" />
            <SheetHeader className="mb-6 text-left">
              <SheetTitle>Share this post</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-y-4">
              <ShareOption icon={LinkIcon} label="Copy" onClick={onCopyLink} />
              <ShareOption
                icon={TwitterXIcon}
                label="X"
                onClick={() => onShare("twitter")}
              />
              <ShareOption
                icon={FacebookIcon}
                label="Facebook"
                onClick={() => onShare("facebook")}
              />
              <ShareOption
                icon={LinkedinIcon}
                label="LinkedIn"
                onClick={() => onShare("linkedin")}
              />
              <ShareOption
                icon={WhatsappIcon}
                label="WhatsApp"
                onClick={() => onShare("whatsapp")}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function ShareMenuItem({
  onClick,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  icon: React.ComponentType<
    AnimatedIconProps & React.RefAttributes<AnimatedIconHandle>
  >;
  label: string;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="gap-2 cursor-pointer"
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <Icon ref={iconRef} className="h-4 w-4" /> {label}
    </DropdownMenuItem>
  );
}

function ShareOption({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<
    AnimatedIconProps & React.RefAttributes<AnimatedIconHandle>
  >;
  label: string;
  onClick: () => void;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2"
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-primary/20 hover:text-primary">
        <Icon ref={iconRef} className="h-5 w-5 text-foreground" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
