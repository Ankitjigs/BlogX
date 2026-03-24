"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/ui/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  PenLine,
  BarChart3,
  Settings,
  Zap,
  ExternalLink,
  Home,
  Bell,
} from "lucide-react";
import { ModeToggle } from "@/components/providers/mode-toggle";
import GlobalAIChatButton from "@/components/ai-chat/GlobalAIChatButton";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/posts", icon: FileText, label: "Posts" },
  { href: "/dashboard/drafts", icon: PenLine, label: "Drafts" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "/", icon: Home, label: "Public Site" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">BlogX</h1>
            <p className="text-xs text-muted-foreground">Creator Studio</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto custom-scrollbar">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-10 p-4 flex h-20 items-center justify-between border-b border-border bg-card/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SearchBar className="block" />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-2 md:flex! cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Home
              </Button>
            </Link>
            <Link href="/" className="md:hidden!">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <ModeToggle />
            <div className="ml-2 relative h-8 w-8 flex items-center justify-center">
              <ClerkLoading>
                <Skeleton className="h-8 w-8 rounded-full" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserMenu />
              </ClerkLoaded>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="mx-auto w-full max-w-6xl p-8">{children}</div>
      </main>

      {/* AI Chat FAB */}
      <GlobalAIChatButton />
    </div>
  );
}
