import { getPosts, createPostAction } from "@/actions/post";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  MessageCircle,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PostActionsMenu } from "@/components/dashboard/post-actions-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PaginationControls } from "@/components/ui/pagination-controls";

export default async function DashboardPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const { posts, metadata } = await getPosts(page);

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Creator</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="font-semibold text-primary">Dashboard Overview</span>
      </nav>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Views */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Views
            </p>
            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              +12.5%
            </span>
          </div>
          <h3 className="text-3xl font-bold">128.4k</h3>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[70%] bg-primary"></div>
          </div>
        </div>

        {/* Avg Read Time */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Avg. Read Time
            </p>
            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              +2.1%
            </span>
          </div>
          <h3 className="text-3xl font-bold">4m 32s</h3>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[45%] bg-emerald-500"></div>
          </div>
        </div>

        {/* New Subscribers */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              New Subscribers
            </p>
            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              +5.4%
            </span>
          </div>
          <h3 className="text-3xl font-bold">12,850</h3>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[60%] bg-blue-400"></div>
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Table Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold">Recent Posts</h2>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/posts"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all posts
              <ChevronRight className="h-4 w-4" />
            </Link>
            <form action={createPostAction}>
              <Button className="bg-primary shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                New Post
              </Button>
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Article Title
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Performance
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No posts found. Create your first post!
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className="transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <span className="text-xs text-muted-foreground">
                                📝
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/editor/${post.id}`}
                                  className="line-clamp-1 text-sm font-semibold hover:text-primary max-w-[200px] md:max-w-[300px]"
                                >
                                  {post.title || "Untitled Post"}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{post.title || "Untitled Post"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-xs text-muted-foreground">
                            {post.category?.name || "Uncategorized"} •{" "}
                            {post.readTime}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {post.published ? (
                        <Badge className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Published
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {post.published ? (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            {post.viewCount}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            {post.commentCount}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">
                      {formatDistance(new Date(post.updatedAt), new Date(), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/editor/${post.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary hover:bg-secondary"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <PostActionsMenu post={post} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="border-t border-border py-4">
          <PaginationControls
            currentPage={page}
            totalPages={metadata.totalPages}
            hasNextPage={metadata.hasNextPage ?? false}
            hasPrevPage={metadata.hasPrevPage ?? false}
            totalItems={metadata.total}
            itemLabel="posts"
          />
        </div>
      </div>
    </div>
  );
}
