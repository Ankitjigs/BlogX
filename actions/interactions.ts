"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { User } from "@clerk/nextjs/server";

// Helper: Ensures the Clerk user exists in the Prisma database
async function ensureUserExists(user: User) {
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          "Anonymous",
        image: user.imageUrl,
      },
    });
  }
}

// ================================
// Likes
// ================================

export async function toggleLike(postId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureUserExists(user);

  const existing = await prisma.like.findUnique({
    where: {
      userId_postId: { userId: user.id, postId },
    },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.like.create({
      data: { userId: user.id, postId },
    });
  }

  revalidatePath(`/posts/[slug]`, "page");
  return { isLiked: !existing };
}

export async function checkIsLiked(postId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const like = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  return !!like;
}

export async function getLikeCount(postId: string) {
  return await prisma.like.count({ where: { postId } });
}

// ================================
// Bookmarks
// ================================

export async function toggleBookmark(postId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureUserExists(user);

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId: user.id, postId },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.bookmark.create({
      data: { userId: user.id, postId },
    });
  }

  revalidatePath(`/posts/[slug]`, "page");
  return { isBookmarked: !existing };
}

export async function checkIsBookmarked(postId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  return !!bookmark;
}

// ================================
// Comments
// ================================

export async function createComment(
  postId: string,
  content: string,
  parentId?: string,
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureUserExists(user);

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: user.id,
      postId,
      parentId: parentId || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  revalidatePath(`/posts/[slug]`, "page");
  return comment;
}

export async function getComments(postId: string) {
  const user = await currentUser();
  const userId = user?.id;

  // Helper to include likes
  const includeLikes = {
    likes: {
      where: { userId: userId || "undefined_user" },
      select: { userId: true },
    },
    _count: {
      select: { likes: true },
    },
  };

  // Get top-level comments with replies (3 levels deep for now)
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    include: {
      user: { select: { id: true, name: true, image: true } },
      ...includeLikes,
      replies: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          ...includeLikes,
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
              ...includeLikes,
              replies: {
                include: {
                  user: { select: { id: true, name: true, image: true } },
                  ...includeLikes,
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform to add isLiked boolean
  // Infer the type from the query result
  // Transform to add isLiked boolean
  type CommentWithRelations = (typeof comments)[number];

  // Define the return type to avoid inference loops
  type CommentWithLike = Omit<CommentWithRelations, "replies"> & {
    isLiked: boolean;
    likesCount: number;
    replies: CommentWithLike[];
  };

  const transformComment = (c: CommentWithRelations): CommentWithLike => ({
    ...c,
    isLiked: c.likes.length > 0,
    likesCount: c._count.likes,
    replies: c.replies?.map(transformComment) || [],
  });

  return comments.map(transformComment);
}

export async function getCommentCount(postId: string) {
  return await prisma.comment.count({ where: { postId } });
}

export async function toggleCommentLike(commentId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureUserExists(user);

  const existing = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: { userId: user.id, commentId },
    },
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.commentLike.create({
      data: { userId: user.id, commentId },
    });

    // Create Notification
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });

    if (comment && comment.userId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: comment.userId,
          actorId: user.id,
          type: "LIKE_COMMENT",
          postId: comment.postId,
          commentId: commentId,
        },
      });
    }
  }

  // revalidatePath(`/posts/[slug]`, "page");
  return { isLiked: !existing };
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { authorId: true } } },
  });

  if (!comment) throw new Error("Comment not found");

  // Allow deletion if user owns comment OR owns the post
  if (comment.userId !== userId && comment.post.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/posts/[slug]`, "page");
}

// ================================
// Views
// ================================

export async function incrementPostView(postId: string) {
  const { userId } = await auth();

  await prisma.postView.create({
    data: {
      postId,
      userId: userId || null,
    },
  });
}

export async function getViewCount(postId: string) {
  return await prisma.postView.count({ where: { postId } });
}

// ================================
// Post Stats (aggregated)
// ================================

export async function getPostStats(postId: string) {
  const [likes, comments, bookmarks, views] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    prisma.comment.count({ where: { postId } }),
    prisma.bookmark.count({ where: { postId } }),
    prisma.postView.count({ where: { postId } }),
  ]);

  return { likes, comments, bookmarks, views };
}

// ================================
// Notifications
// ================================

export async function getNotifications() {
  const user = await currentUser();
  if (!user) return [];

  const notifications = await prisma.notification.findMany({
    where: { recipientId: user.id },
    include: {
      actor: {
        select: { id: true, name: true, image: true },
      },
      post: {
        select: { id: true, title: true, slug: true },
      },
      comment: {
        select: { id: true, content: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications;
}

export async function getUnreadNotificationCount() {
  const user = await currentUser();
  if (!user) return 0;

  return await prisma.notification.count({
    where: { recipientId: user.id, isRead: false },
  });
}

export async function markNotificationRead(notificationId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { recipientId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/dashboard/notifications");
}
