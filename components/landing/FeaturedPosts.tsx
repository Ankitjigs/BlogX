import { getPublishedPosts } from "@/actions/post";
import PostCard from "@/components/blog/PostCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CategoryFilter from "./CategoryFilter";

const categories = ["All", "Design", "Tech", "Business", "Life"];

export default async function FeaturedPosts() {
  const posts = await getPublishedPosts();

  return (
    <section id="featured" className="py-20 bg-[#f5f6f8] dark:bg-[#0f1323]">
      <div className="mx-auto max-w-300 px-6">
        {/* Header with Category Filter */}
        <div className="mb-12 flex flex-col md:flex-row! md:items-end md:justify-between gap-6">
          <div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Editor&apos;s Picks
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Hand-curated stories from our community&apos;s top thinkers.
            </p>
          </div>

          {/* Categories Filter */}
          <CategoryFilter categories={categories} />
        </div>

        {/* Article Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No posts published yet. Be the first to write!
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-20 flex justify-center">
          <Link
            href="/posts"
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-bold transition-colors hover:bg-slate-50 dark:border-[#262626] dark:bg-[#161616] dark:hover:bg-neutral-800"
          >
            View all articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
