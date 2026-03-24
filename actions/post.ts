"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createPostContentHash } from "@/llm/content";
import { enqueuePostSummaryJob } from "@/lib/ai-jobs";

// Ensure local user exists based on Clerk user
async function syncUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        image: user.imageUrl,
      },
    });
  }
  return dbUser;
}

// Form action wrapper (accepts FormData for use with <form action={...}>)
export async function createPostAction(_formData: FormData) {
  const post = await createPost();
  revalidatePath("/dashboard");
  redirect(`/editor/${post.id}`);
}

export async function createPost(data?: {
  title?: string;
  titleContent?: Prisma.InputJsonValue;
  content?: Prisma.InputJsonValue;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  published?: boolean;
}) {
  const user = await syncUser();

  const timestamp = Date.now();
  const title = data?.title || "Untitled Post";
  const slug = data?.slug || `untitled-${timestamp}`;

  const post = await prisma.post.create({
    data: {
      title,
      titleContent: data?.titleContent,
      slug,
      authorId: user.id,
      content: data?.content || {},
      excerpt: data?.excerpt || null,
      coverImage: data?.coverImage || null,
      published: data?.published || false,
    },
  });

  if (post.published) {
    const hash = createPostContentHash({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    });
    await enqueuePostSummaryJob({ postId: post.id, contentHash: hash });
  }

  return post;
}

export async function getCategories() {
  const { userId } = await auth();
  if (!userId) return [];

  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Check if exists
  const existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) return existing;

  return await prisma.category.create({
    data: {
      name,
      slug,
    },
  });
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    titleContent?: Prisma.InputJsonValue;
    content?: Prisma.InputJsonValue;
    published?: boolean;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    // SEO
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    // Tags directly as strings
    tags?: string[];
    categoryId?: string;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.authorId !== userId) {
    throw new Error("Unauthorized or Post not found");
  }

  const nextTitle = data.title ?? post.title;
  const nextExcerpt = data.excerpt ?? post.excerpt;
  const nextContent = data.content ?? post.content ?? {};
  const nextPublished = data.published ?? post.published;
  const nextHash = createPostContentHash({
    title: nextTitle,
    excerpt: nextExcerpt,
    content: nextContent,
  });
  const previousHash =
    post.aiSummaryHash ||
    createPostContentHash({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    });
  const publishTransition = !post.published && nextPublished;
  const contentChanged = nextHash !== previousHash;

  // Handle tags relationship if provided
  const tagsUpdate = data.tags
    ? {
        tags: {
          set: [], // Disconnect all existing
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, "-") },
          })),
        },
      }
    : {};

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      titleContent: data.titleContent,
      content: data.content,
      published: data.published,
      slug: data.slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      canonicalUrl: data.canonicalUrl,
      updatedAt: new Date(),
      ...tagsUpdate,
      categoryId: data.categoryId,
    },
  });

  if (nextPublished && (publishTransition || contentChanged)) {
    await enqueuePostSummaryJob({ postId: id, contentHash: nextHash });
  }

  revalidatePath("/dashboard");
}

export async function getPost(id: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      tags: true,
    },
  });

  if (post?.authorId !== userId) return null;
  return post;
}

interface JSONContent {
  type?: string;
  content?: JSONContent[];
  text?: string;
}

function calculateReadTime(content: Prisma.JsonValue): string {
  const getWordCount = (node: JSONContent): number => {
    if (!node) return 0;
    if (node.type === "text" && typeof node.text === "string") {
      return node.text.trim().split(/\s+/).length;
    }
    if (node.content && Array.isArray(node.content)) {
      return node.content.reduce(
        (acc: number, child: JSONContent) => acc + getWordCount(child),
        0,
      );
    }
    return 0;
  };

  const words = getWordCount(content as JSONContent);
  const minutes = Math.ceil(words / 200);
  return `${Math.max(1, minutes)} min read`;
}

export async function getPosts(
  page = 1,
  limit = 10,
  status?: "all" | "published" | "draft",
) {
  const { userId } = await auth();
  if (!userId)
    return {
      posts: [],
      metadata: {
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        currentPage: page,
      },
    };

  const skip = (page - 1) * limit;

  // Build where clause based on status filter
  const whereClause: { authorId: string; published?: boolean } = {
    authorId: userId,
  };
  if (status === "published") {
    whereClause.published = true;
  } else if (status === "draft") {
    whereClause.published = false;
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        category: true,
        tags: true,
        _count: {
          select: {
            views: true,
            comments: true,
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where: whereClause }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      readTime: calculateReadTime(post.content),
      viewCount: post._count.views,
      commentCount: post._count.comments,
      likeCount: post._count.likes,
    })),
    metadata: {
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      currentPage: page,
    },
  };
}

export async function getPublishedPosts(categorySlug?: string) {
  const whereClause: Prisma.PostWhereInput = { published: true };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  return await prisma.post.findMany({
    where: whereClause,
    include: {
      author: true,
      tags: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: true,
      category: true,
    },
  });

  if (post) return post;

  // Fallback: Try to find by ID if slug lookup failed
  // This handles cases where the URL contains the ID instead of the slug
  return await prisma.post.findUnique({
    where: { id: slug },
    include: {
      author: true,
      tags: true,
      category: true,
    },
  });
}

export async function togglePostStatus(id: string, published: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== userId) throw new Error("Unauthorized");

  await prisma.post.update({
    where: { id },
    data: { published },
  });

  if (published) {
    const hash = createPostContentHash({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
    });
    if (post.aiSummaryHash !== hash) {
      await enqueuePostSummaryJob({ postId: id, contentHash: hash });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/editor/${id}`);
}

export async function deletePost(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== userId) throw new Error("Unauthorized");

  await prisma.post.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function duplicatePost(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const originalPost = await prisma.post.findUnique({ where: { id } });
  if (!originalPost || originalPost.authorId !== userId)
    throw new Error("Unauthorized");

  const newPost = await prisma.post.create({
    data: {
      title: `${originalPost.title} (Copy)`,
      slug: `${originalPost.slug}-copy-${Date.now()}`,
      content: originalPost.content ?? {},
      excerpt: originalPost.excerpt,
      coverImage: originalPost.coverImage,
      published: false, // Always draft
      authorId: userId,
    },
  });

  revalidatePath("/dashboard");
  return newPost;
}
