"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  Eye,
  Trash2,
  Copy,
  Globe,
  Archive,
  Send,
  BarChart,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { deletePost, togglePostStatus, duplicatePost } from "@/actions/post";

interface PostActionsMenuProps {
  post: Prisma.PostGetPayload<{
    include: { tags: true; category: true };
  }>;
}

export function PostActionsMenu({ post }: PostActionsMenuProps) {
  const {
    id: postId,
    title: postTitle,
    slug: postSlug,
    published: isPublished,
  } = post;
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUnpublishDialogOpen, setIsUnpublishDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deletePost(postId);
      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setIsLoading(true);
      await togglePostStatus(postId, false);
      toast.success("Post unpublished");
      setIsUnpublishDialogOpen(false);
    } catch (error) {
      toast.error("Failed to unpublish post");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsLoading(true);
      await togglePostStatus(postId, true);
      toast.success("Post published successfully");
    } catch (error) {
      toast.error("Failed to publish post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      const newPost = await duplicatePost(postId);
      toast.success("Post duplicated");
      // Optional: Redirect to the new post
      // router.push(`/editor/${newPost.id}`);
    } catch (error) {
      toast.error("Failed to duplicate post");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    window.open(`/posts/${postSlug}`, "_blank");
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/posts/${postSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <>
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>More actions</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Edit Actions */}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/editor/${postId}`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

            {isPublished ? (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => window.open(`/posts/${postSlug}`, "_blank")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Live
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleCopyLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handlePreview}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleDuplicate}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Publish Actions */}
            {isPublished ? (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsUnpublishDialogOpen(true)}
              >
                <Archive className="mr-2 h-4 w-4" />
                Unpublish
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="cursor-pointer text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/20"
                onClick={handlePublish}
              >
                <Send className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Destructive Actions */}
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent closeButtonClassName="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="flex justify-between">Delete?</DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete {postTitle}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unpublish Confirmation Dialog */}
      <Dialog
        open={isUnpublishDialogOpen}
        onOpenChange={setIsUnpublishDialogOpen}
      >
        <DialogContent closeButtonClassName="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Unpublish Post?</DialogTitle>
            <DialogDescription>
              This post will no longer be visible to the public. You can publish
              it again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUnpublishDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUnpublish} disabled={isLoading}>
              {isLoading ? "Unpublishing..." : "Unpublish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
