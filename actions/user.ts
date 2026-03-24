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

export async function toggleFollow(targetUserId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Ensure current user exists in our DB
  await ensureUserExists(user);

  const existingFollow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId,
        },
      },
    });
  } else {
    // Follow
    await prisma.follows.create({
      data: {
        followerId: user.id,
        followingId: targetUserId,
      },
    });

    // Create notification for the followed user (only if not following yourself)
    if (targetUserId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: targetUserId,
          actorId: user.id,
          type: "FOLLOW",
        },
      });
    }
  }

  revalidatePath("/posts/[slug]", "page");
  revalidatePath("/feed");
  revalidatePath("/dashboard/notifications");

  return { isFollowing: !existingFollow };
}

export async function checkIsFollowing(targetUserId: string) {
  const user = await currentUser();
  if (!user) return false;

  const follow = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  return !!follow;
}

export async function getFollowerCount(userId: string) {
  return await prisma.follows.count({
    where: { followingId: userId },
  });
}

export async function getFollowingCount(userId: string) {
  return await prisma.follows.count({
    where: { followerId: userId },
  });
}

export async function getUserProfile(userId: string) {
  const [user, followerCount, followingCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    }),
    prisma.follows.count({ where: { followingId: userId } }),
    prisma.follows.count({ where: { followerId: userId } }),
  ]);

  if (!user) return null;

  return {
    ...user,
    followerCount,
    followingCount,
  };
}

export async function updateUserProfile(data: {
  name?: string;
  bio?: string;
  image?: string;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const { clerkClient } = await import("@clerk/nextjs/server");

  // 1. Update Prisma (Database)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      bio: data.bio,
      ...(data.image && { image: data.image }), // Only update image if provided
    },
  });

  // 2. Sync to Clerk (Metadata)
  // We only sync Bio to metadata because Name is handled by user.update() on client or separate call
  // But wait, the client code calls user.update() for name.
  // Let's ensure we sync bio to publicMetadata so it persists in session.
  if (data.bio !== undefined) {
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      publicMetadata: {
        bio: data.bio,
      },
    });
  }

  revalidatePath("/dashboard/settings");
}
