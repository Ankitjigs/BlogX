import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { UserMenu } from "@/components/layout/UserMenu";
import { PenSquare, Bell } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/providers/mode-toggle";
import SearchBar from "@/components/ui/search-bar";
import { getUnreadNotificationCount } from "@/actions/interactions";

export default async function Navbar() {
  const { userId } = await auth();

  // Fetch unread notification count if user is logged in
  const unreadCount = userId ? await getUnreadNotificationCount() : 0;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-[#f5f6f8]/80 backdrop-blur-md dark:border-[#232348] dark:bg-[#0f1323]/80 glass-nav">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        {/* Left Section: Logo + Links */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo />
            {/* <span className="text-xl font-bold tracking-tight">BlogX</span> */}
          </Link>
        </div>

        {/* Search Bar - Repositioned */}
        <div className="mx-4 flex-1 max-w-xl">
          <SearchBar className="block w-full" />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              {/* Notification Bell */}
              <Link href="/dashboard/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#232348] dark:hover:bg-[#2d2d5a]"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                </Button>
              </Link>

              {/* Write Button */}
              <Link href="/editor">
                <Button className="rounded-full bg-primary px-5 font-semibold shadow-lg shadow-primary/20 hover:bg-blue-700">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Write
                </Button>
              </Link>

              {/* User Avatar */}
              <div className="ml-2 relative h-8 w-8 flex items-center justify-center">
                <ClerkLoading>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </ClerkLoading>
                <ClerkLoaded>
                  <UserMenu />
                </ClerkLoaded>
              </div>

              <ModeToggle />
            </>
          ) : (
            <>
              <ModeToggle />
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  className="font-semibold hover:text-primary"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-full bg-primary px-5 font-semibold shadow-lg shadow-primary/20 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile Search Bar */}
      <div className="border-t border-border px-6 py-3 lg:hidden">
        <div className="border-t border-border px-6 py-3 lg:hidden">
          <SearchBar isMobile />
        </div>
      </div>
    </nav>
  );
}
