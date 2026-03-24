import Link from "next/link";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  Eye,
  MessageSquare,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { getPosts, deletePost } from "@/actions/post";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PostActionsMenu } from "@/components/dashboard/post-actions-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const status = (params.status as "all" | "published" | "draft") || "all";

  const { posts, metadata } = await getPosts(page, 10, status);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Manage and organize your blog posts.
          </p>
        </div>
        <Link
          href="/editor"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Status Filter Tabs */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/posts?status=all"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                status === "all"
                  ? "bg-secondary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              All Posts
            </Link>
            <Link
              href="/dashboard/posts?status=published"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                status === "published"
                  ? "bg-secondary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Published
            </Link>
            <Link
              href="/dashboard/posts?status=draft"
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                status === "draft"
                  ? "bg-secondary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Drafts
            </Link>
          </div>
        </div>

        {/* Posts List */}
        <div className="divide-y divide-border">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-6 hover:bg-secondary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        {post.title || "Untitled Post"}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground max-w-160">
                      {post.excerpt || "No excerpt available"}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(post.updatedAt), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount} comments
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.published && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/editor/${post.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>
                  <PostActionsMenu post={post} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts found. Start writing your first post!
              </p>
              <Link
                href="/editor"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {metadata.totalPages > 1 && (
          <div className="border-t border-border p-4">
            <PaginationControls
              currentPage={metadata.currentPage}
              totalPages={metadata.totalPages}
              hasNextPage={metadata.hasNextPage}
              hasPrevPage={metadata.hasPrevPage}
              totalItems={metadata.total}
              itemLabel="posts"
            />
          </div>
        )}

        {/* Summary */}
        {posts.length > 0 && metadata.totalPages <= 1 && (
          <div className="border-t border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {posts.length} of {metadata.total} posts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
