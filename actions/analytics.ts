"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

// ================================
// Dashboard Analytics
// ================================

export async function getDashboardStats() {
  const { userId } = await auth();
  if (!userId) return null;

  // Get all user's posts
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    select: { id: true },
  });

  const postIds = posts.map((p) => p.id);

  // Aggregate stats across all user's posts
  const [totalViews, totalLikes, totalComments, totalBookmarks, followerCount] =
    await Promise.all([
      prisma.postView.count({ where: { postId: { in: postIds } } }),
      prisma.like.count({ where: { postId: { in: postIds } } }),
      prisma.comment.count({ where: { postId: { in: postIds } } }),
      prisma.bookmark.count({ where: { postId: { in: postIds } } }),
      prisma.follows.count({ where: { followingId: userId } }),
    ]);

  // Calculate engagement rate (likes + comments / views * 100)
  const engagementRate =
    totalViews > 0
      ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1)
      : "0";

  return {
    totalViews,
    totalLikes,
    totalComments,
    totalBookmarks,
    followerCount,
    engagementRate,
    postCount: posts.length,
  };
}

export async function getTopPosts(limit = 5) {
  const { userId } = await auth();
  if (!userId) return [];

  // Get user's posts with view counts
  const posts = await prisma.post.findMany({
    where: { authorId: userId, published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      _count: {
        select: {
          views: true,
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      views: { _count: "desc" },
    },
    take: limit,
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    views: post._count.views,
    likes: post._count.likes,
    comments: post._count.comments,
  }));
}

export async function getRecentActivity(limit = 10) {
  const { userId } = await auth();
  if (!userId) return [];

  // Get recent comments and likes on user's posts
  const [recentComments, recentLikes] = await Promise.all([
    prisma.comment.findMany({
      where: {
        post: { authorId: userId },
      },
      include: {
        user: { select: { name: true, image: true } },
        post: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.like.findMany({
      where: {
        post: { authorId: userId },
      },
      include: {
        user: { select: { name: true, image: true } },
        post: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  // Combine and sort by date
  const activity = [
    ...recentComments.map((c) => ({
      type: "comment" as const,
      user: c.user,
      post: c.post,
      content: c.content.slice(0, 50),
      createdAt: c.createdAt,
    })),
    ...recentLikes.map((l) => ({
      type: "like" as const,
      user: l.user,
      post: l.post,
      content: null,
      createdAt: l.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  return activity;
}
