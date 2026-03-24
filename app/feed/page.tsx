import Link from "next/link";
import { getPublishedPosts } from "@/actions/post";
import { formatDistance } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import {
  Zap,
  Search,
  Bell,
  LayoutGrid,
  List,
  Bookmark,
  TrendingUp,
  Code,
  Palette,
  Clock,
  Brain,
  PenLine,
  ArrowUp,
  Plus,
} from "lucide-react";
import { ModeToggle } from "@/components/providers/mode-toggle";

interface FeedPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { userId } = await auth();
  const { category } = await searchParams;
  const posts = await getPublishedPosts(category);

  // Static for now, can be dynamic later
  const trendingTopics = [
    { name: "Design", icon: Palette, slug: "design", count: "2.4k" },
    { name: "Engineering", icon: Code, slug: "engineering", count: "1.8k" },
    { name: "Productivity", icon: Clock, slug: "productivity", count: "1.2k" },
    { name: "Web3", icon: Brain, slug: "web3", count: "940" },
    { name: "Writing", icon: PenLine, slug: "writing", count: "850" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0f1323]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#f5f6f8]/80 px-4 py-3 backdrop-blur-md dark:border-[#232348] dark:bg-[#0f1323]/80 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Zap className="h-4 w-4" />
              </div>
              <h2 className="hidden text-xl font-bold leading-tight tracking-tight sm:block">
                BlogX
              </h2>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/feed"
                className={`text-sm font-medium ${
                  !category
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Discover
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Following
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Library
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl flex-1">
            <label className="relative flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-slate-400 dark:text-[#9292c9]" />
              <input
                className="h-10 w-full rounded-xl border-none bg-slate-100 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:bg-[#232348]"
                placeholder="Search for stories, topics, or authors..."
              />
            </label>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-[#232348] dark:hover:bg-[#2d2d5a]">
              <Bell className="h-5 w-5" />
            </button>
            <div className="mx-1 h-8 w-[1px] bg-slate-200 dark:bg-[#232348]" />
            {userId ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link
                href="/sign-in"
                className="h-9 w-9 rounded-full border border-slate-200 bg-slate-300 dark:border-[#232348]"
              />
            )}
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 lg:flex-row lg:p-10">
        {/* Left Content Area */}
        <div className="flex flex-1 flex-col gap-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">
                {category
                  ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
                  : "Your Feed"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-[#9292c9]">
                {category
                  ? `Latest stories from ${category}`
                  : "Based on your interests"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-[#232348]">
              <button className="rounded-lg bg-white p-2 text-primary shadow-sm dark:bg-primary dark:text-white">
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-white/50 dark:text-[#9292c9] dark:hover:bg-white/10">
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Article Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/50 dark:border-[#232348] dark:bg-[#111122]"
                >
                  {/* Cover */}
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-[#232348]">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2">
                    {post.category && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold leading-snug transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-[#9292c9]">
                      {post.excerpt || "No excerpt available."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-[#232348]">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full bg-slate-300 bg-cover"
                        style={{
                          backgroundImage: post.author.image
                            ? `url(${post.author.image})`
                            : undefined,
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">
                          {post.author.name || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDistance(
                            new Date(post.createdAt),
                            new Date(),
                            {
                              addSuffix: true,
                            },
                          )}{" "}
                          • 5 min read
                        </span>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-primary">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-500">
                No posts found {category ? `in ${category}` : ""}. Check back
                later!
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="flex w-full flex-col gap-8 lg:w-[320px]">
          {/* Trending Topics */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-[#232348] dark:bg-[#111122]">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trending Topics
            </h3>
            <div className="flex flex-col gap-1">
              {trendingTopics.map((topic, index) => {
                const Icon = topic.icon;
                const isActive = topic.slug === category;
                return (
                  <Link
                    key={topic.name}
                    href={`/feed?category=${topic.slug}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-slate-50 dark:hover:bg-[#232348]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{topic.name}</span>
                    <span
                      className={`ml-auto text-[10px] font-bold opacity-40 ${
                        isActive ? "text-white" : ""
                      }`}
                    >
                      {topic.count}
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/feed"
              className="mt-4 block w-full rounded-xl border border-primary/20 py-2 text-center text-sm font-bold text-primary transition-colors hover:bg-primary/5"
            >
              Clear filters
            </Link>
          </div>

          {/* Write CTA */}
          <div className="rounded-xl bg-primary p-6 text-white shadow-xl shadow-primary/20">
            <h4 className="mb-2 text-lg font-bold">Have a story to tell?</h4>
            <p className="mb-4 text-sm text-white/80">
              Share your knowledge with over 2 million readers on BlogX.
            </p>
            <Link
              href="/editor"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-primary transition-colors hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              Write on BlogX
            </Link>
          </div>
        </aside>
      </main>

      {/* Scroll to Top */}
      <button className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-2xl dark:border-none dark:bg-primary dark:text-white">
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
