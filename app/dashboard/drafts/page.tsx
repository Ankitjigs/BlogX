import Link from "next/link";
import { format } from "date-fns";
import { Plus, FileText, Edit2 } from "lucide-react";
import { getPosts } from "@/actions/post";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PostActionsMenu } from "@/components/dashboard/post-actions-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DraftsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DraftsPage({ searchParams }: DraftsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  // Re-use getPosts but filter for drafts only
  const { posts, metadata } = await getPosts(page, 10, "draft");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drafts</h1>
          <p className="text-muted-foreground">
            Manage your unpublished work in progress.
          </p>
        </div>
        <Link
          href="/editor"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Draft
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Posts List */}
        <div className="divide-y divide-border">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-6 hover:bg-secondary/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">
                        {post.title || "Untitled Draft"}
                      </h3>
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Draft
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {post.excerpt || "No excerpt available"}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Updated{" "}
                        {format(new Date(post.updatedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
            <div className="py-12 text-center text-muted-foreground">
              <p>No drafts found.</p>
              <Link
                href="/editor"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Start Writing
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
              itemLabel="drafts"
            />
          </div>
        )}
      </div>
    </div>
  );
}
