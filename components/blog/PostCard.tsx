import Link from "next/link";
import { formatDistance } from "date-fns";
import { Bookmark } from "lucide-react";
import { Prisma } from "@prisma/client";

type PostWithRelations = Prisma.PostGetPayload<{
  include: { author: true; tags: true; category: true };
}>;

interface PostCardProps {
  post: PostWithRelations;
}

export default function PostCard({ post }: PostCardProps) {
  const readingTime = "5 min read";

  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="group cursor-pointer">
        {/* Cover Image */}
        <div className="mb-5 aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-[#262626] dark:bg-[#161616]">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
              <span className="text-sm text-slate-400 dark:text-slate-500">
                No Cover
              </span>
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="mb-3 flex items-center gap-3">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {post.category.name}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {readingTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="mb-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {post.excerpt || "No excerpt available."}
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full bg-slate-300 bg-cover bg-center"
            style={{
              backgroundImage: post.author.image
                ? `url(${post.author.image})`
                : undefined,
            }}
          />
          <span className="text-sm font-semibold">{post.author.name}</span>
        </div>
      </article>
    </Link>
  );
}
