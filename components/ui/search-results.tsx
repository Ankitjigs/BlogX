"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Hash, User } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface SearchResultsProps {
  results: {
    posts: {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
    }[];
    authors: { id: string; name: string | null; image: string | null }[];
    tags: { id: string; name: string; slug: string }[];
  };
  isLoading: boolean;
  onSelect: () => void;
}

export default function SearchResults({
  results,
  isLoading,
  onSelect,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="absolute left-0 top-12 z-50 w-full rounded-xl border border-border bg-popover p-4 shadow-xl">
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
        </div>
      </div>
    );
  }

  const hasResults =
    results.posts.length > 0 ||
    results.authors.length > 0 ||
    results.tags.length > 0;

  if (!hasResults) {
    return null;
  }

  return (
    <div className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-xl ring-1 ring-black/5 dark:ring-white/10">
      <div className="max-h-[400px] overflow-y-auto p-2">
        {/* Posts Section */}
        {results.posts.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              Posts
            </h3>
            {results.posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                onClick={onSelect}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="line-clamp-1 text-sm font-medium">
                    {post.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Authors Section */}
        {results.authors.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              Authors
            </h3>
            {results.authors.map((author) => (
              <Link
                key={author.id}
                href={`/author/${author.id}`} // Assuming author page exists or will exist
                onClick={onSelect}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author.image || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium">{author.name}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Tags Section */}
        {results.tags.length > 0 && (
          <div>
            <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 px-2">
              {results.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`} // Assuming tags page exists
                  onClick={onSelect}
                  className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium transition-colors hover:bg-primary/20 hover:text-primary"
                >
                  <Hash className="h-3 w-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
