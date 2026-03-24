import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";
import { getDashboardStats, getTopPosts } from "@/actions/analytics";

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();
  const topPosts = await getTopPosts(5);

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const statCards = [
    {
      label: "Total Views",
      value: formatNumber(stats?.totalViews || 0),
      icon: Eye,
    },
    {
      label: "Total Likes",
      value: formatNumber(stats?.totalLikes || 0),
      icon: Heart,
    },
    {
      label: "Total Comments",
      value: formatNumber(stats?.totalComments || 0),
      icon: MessageSquare,
    },
    {
      label: "Followers",
      value: formatNumber(stats?.followerCount || 0),
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your blog performance and engagement metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Rate Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Engagement Rate</p>
            <p className="text-2xl font-bold">{stats?.engagementRate || 0}%</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          (Likes + Comments) / Views × 100
        </p>
      </div>

      {/* Top Performing Posts */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top Performing Posts</h2>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {topPosts.length > 0 ? (
            topPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium">{post.title}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="h-3 w-3" />
                    {post.likes}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {post.comments}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No published posts yet.</p>
              <Link
                href="/editor"
                className="mt-2 inline-block text-primary hover:underline"
              >
                Create your first post
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Sources - Coming Soon */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Traffic Sources</h2>
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <p>Traffic source tracking coming soon</p>
        </div>
      </div>
    </div>
  );
}
