import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPostBySlug } from "@/actions/post";
import {
  checkIsFollowing,
  getFollowerCount,
  getFollowingCount,
} from "@/actions/user";
import {
  getPostStats,
  getComments,
  checkIsLiked,
  checkIsBookmarked,
  incrementPostView,
} from "@/actions/interactions";
import PostViewer from "@/components/blog/PostViewer";
import PostSummaryCard from "@/components/blog/PostSummaryCard";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ScrollToTop from "@/components/blog/ScrollToTop";
import PostActions from "@/components/blog/PostActions";
import FollowButton from "@/components/blog/FollowButton";
import CommentsSection from "@/components/blog/CommentsSection";
import AuthorBio from "@/components/blog/AuthorBio";
import PostPageClient from "@/components/blog/PostPageClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JSONContent } from "@tiptap/react";
import Link from "next/link";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const isPreview = !post.published;

  const socialData = isPreview
    ? null
    : await Promise.all([
        checkIsFollowing(post.authorId),
        getFollowerCount(post.authorId),
        getFollowingCount(post.authorId),
        getPostStats(post.id),
        getComments(post.id),
        checkIsLiked(post.id),
        checkIsBookmarked(post.id),
      ]);

  const [
    isFollowing,
    followerCount,
    followingCount,
    stats,
    comments,
    isLiked,
    isBookmarked,
  ] = socialData ?? [
    false,
    0,
    0,
    { likes: 0, comments: 0 },
    [],
    false,
    false,
  ];

  // Track view (fire and forget)
  if (!isPreview) {
    incrementPostView(post.id).catch(() => {});
  }

  // Estimate reading time
  const contentStr = JSON.stringify(post.content || {});
  const wordCount = contentStr.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Fix null name display
  const authorName = post.author.name || "Anonymous Writer";

  return (
    <PostPageClient authorId={post.authorId} isFollowing={isFollowing}>
      <div className="relative min-h-screen bg-background">
        {/* Dynamic Reading Progress Bar */}
        <ReadingProgress />

        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-12 lg:flex-row lg:px-20">
          {/* Left Sidebar: Table of Contents */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-28 flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                  Table of Contents
                </h3>
                <p className="text-sm text-muted-foreground">
                  {readingTime} min read
                </p>
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  href="#intro"
                  className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-primary"
                >
                  <span className="text-sm font-semibold">Introduction</span>
                </Link>
                <Link
                  href="#content"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                >
                  <span className="text-sm font-medium">Main Content</span>
                </Link>
                {!isPreview && (
                  <Link
                    href="#comments-section"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                  >
                    <span className="text-sm font-medium">Comments</span>
                  </Link>
                )}
              </nav>

              {!isPreview && (
                <div className="mt-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.image || ""} />
                      <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                        {authorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">{authorName}</p>
                      <p className="text-xs text-muted-foreground">Author</p>
                    </div>
                  </div>
                  <FollowButton
                    authorId={post.authorId}
                    initialIsFollowing={isFollowing}
                    className="mt-3 w-full rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <article className="mx-auto max-w-[720px] flex-1">
            {/* Article Header */}
            <header className="mb-8 flex flex-col">
              <h1 className="text-4xl font-black leading-[1.15] tracking-tight lg:text-5xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-xl italic leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              <div className="my-8 h-px bg-border" />

              {/* Author Profile */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                      {authorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold leading-tight">
                        {authorName}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "MMM d, yyyy")} •{" "}
                      {readingTime} min read
                    </p>
                  </div>
                </div>

                {!isPreview && (
                  <FollowButton
                    authorId={post.authorId}
                    initialIsFollowing={isFollowing}
                    size="default"
                    className="px-6"
                  />
                )}
              </div>

              {/* Desktop Static Actions */}
              {!isPreview && (
                <div className="mt-8">
                  <PostActions
                    slug={post.slug}
                    title={post.title}
                    postId={post.id}
                    likes={stats.likes}
                    comments={stats.comments}
                    initialIsLiked={isLiked}
                    initialIsBookmarked={isBookmarked}
                  />
                </div>
              )}
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="group relative mb-12 aspect-video w-full overflow-hidden rounded-2xl">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent"></div>
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            {/* Post Content */}
            <PostSummaryCard
              short={post.aiSummaryShort}
              long={post.aiSummaryLong}
              bullets={post.aiSummaryBullets}
            />
            <div
              id="content"
              className="prose-content text-lg leading-relaxed text-muted-foreground"
            >
              <PostViewer content={post.content as JSONContent} />
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {!isPreview && (
              <>
                <AuthorBio
                  author={post.author}
                  isFollowing={isFollowing}
                  followerCount={followerCount}
                  followingCount={followingCount}
                />
                <CommentsSection
                  postId={post.id}
                  initialComments={comments}
                  postAuthorId={post.authorId}
                />
              </>
            )}
          </article>
        </div>

        {/* Scroll to Top */}
        <ScrollToTop />
      </div>
    </PostPageClient>
  );
}
