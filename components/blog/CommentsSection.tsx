"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Loader2, Heart } from "lucide-react";
import {
  createComment,
  deleteComment,
  toggleCommentLike,
} from "@/actions/interactions";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentUser;
  replies?: Comment[];
  likesCount: number;
  isLiked: boolean;
}

interface CommentsSectionProps {
  postId: string;
  initialComments: any[]; // relaxed type to accept server data
  postAuthorId: string;
}

export default function CommentsSection({
  postId,
  initialComments,
  postAuthorId,
}: CommentsSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  // Recursive helpers
  const countComments = (list: Comment[]): number => {
    return list.reduce((acc, c) => acc + 1 + countComments(c.replies || []), 0);
  };

  const totalComments = countComments(comments);

  const addReplyToTree = (
    list: Comment[],
    parentId: string,
    reply: Comment,
  ): Comment[] => {
    return list.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: addReplyToTree(c.replies, parentId, reply) };
      }
      return c;
    });
  };

  const removeCommentFromTree = (
    list: Comment[],
    commentId: string,
  ): Comment[] => {
    return list
      .filter((c) => c.id !== commentId)
      .map((c) => ({
        ...c,
        replies: c.replies ? removeCommentFromTree(c.replies, commentId) : [],
      }));
  };

  const updateCommentInTree = (
    list: Comment[],
    commentId: string,
    updates: Partial<Comment>,
  ): Comment[] => {
    return list.map((c) => {
      if (c.id === commentId) return { ...c, ...updates };
      if (c.replies)
        return {
          ...c,
          replies: updateCommentInTree(c.replies, commentId, updates),
        };
      return c;
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return;

    startTransition(async () => {
      try {
        const comment = await createComment(postId, newComment.trim());
        const newC: Comment = {
          ...comment,
          createdAt: new Date(comment.createdAt),
          replies: [],
          likesCount: 0,
          isLiked: false,
        };
        setComments((prev) => [newC, ...prev]);
        setNewComment("");
      } catch (error) {
        toast.error("Failed to post comment");
      }
    });
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    startTransition(async () => {
      try {
        const reply = await createComment(
          postId,
          replyContent.trim(),
          parentId,
        );
        const newR: Comment = {
          ...reply,
          createdAt: new Date(reply.createdAt),
          replies: [],
          likesCount: 0,
          isLiked: false,
        };
        setComments((prev) => addReplyToTree(prev, parentId, newR));
        setReplyContent("");
        setReplyingTo(null);
      } catch (error) {
        toast.error("Failed to post reply");
      }
    });
  };

  const handleDeleteComment = (commentId: string) => {
    startTransition(async () => {
      try {
        await deleteComment(commentId);
        setComments((prev) => removeCommentFromTree(prev, commentId));
        toast.success("Comment deleted");
      } catch (error) {
        toast.error("Failed to delete comment");
      }
    });
  };

  const handleToggleLike = (
    commentId: string,
    currentIsLiked: boolean,
    currentCount: number,
  ) => {
    if (!user) return toast.error("Please sign in to like comments");

    // Optimistic update
    const newIsLiked = !currentIsLiked;
    const newCount = currentIsLiked ? currentCount - 1 : currentCount + 1;

    setComments((prev) =>
      updateCommentInTree(prev, commentId, {
        isLiked: newIsLiked,
        likesCount: newCount,
      }),
    );

    // Fire and forget (optimistic)
    toggleCommentLike(commentId).catch(() => {
      // Revert on error
      setComments((prev) =>
        updateCommentInTree(prev, commentId, {
          isLiked: currentIsLiked,
          likesCount: currentCount,
        }),
      );
      toast.error("Failed to update like");
    });
  };

  const canDelete = (commentUserId: string) => {
    return user?.id === commentUserId || user?.id === postAuthorId;
  };

  const renderComment = (comment: Comment, parentId?: string) => (
    <div key={comment.id} className="flex gap-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.image || ""} />
        <AvatarFallback>{comment.user.name?.[0] || "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {comment.user.name || "Anonymous"}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-foreground">{comment.content}</p>
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() =>
              handleToggleLike(comment.id, comment.isLiked, comment.likesCount)
            }
            className={cn(
              "flex items-center gap-1.5 text-sm hover:text-red-500",
              comment.isLiked ? "text-red-500" : "text-muted-foreground",
            )}
          >
            <Heart
              className={cn("h-4 w-4", comment.isLiked && "fill-current")}
            />
            <span>{comment.likesCount > 0 ? comment.likesCount : "Like"}</span>
          </button>

          <button
            onClick={() =>
              setReplyingTo(replyingTo === comment.id ? null : comment.id)
            }
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Reply</span>
          </button>

          {canDelete(comment.user.id) && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-4 flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl || ""} />
              <AvatarFallback>{user?.firstName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={isPending || !replyContent.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reply"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-border pl-4">
            {comment.replies.map((reply) => renderComment(reply, comment.id))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div id="comments-section" className="mx-auto max-w-[720px] pt-12">
      <h3 className="mb-8 text-2xl font-bold">Comments ({totalComments})</h3>

      {/* New Comment Editor */}
      {user ? (
        <div className="mb-12 flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback>{user.firstName?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none border-border bg-background"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={isPending || !newComment.trim()}
                className="font-semibold"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-12 rounded-lg border border-border bg-secondary/50 p-6 text-center">
          <p className="text-muted-foreground">Sign in to leave a comment</p>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-8">
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
