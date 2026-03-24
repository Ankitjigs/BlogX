import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-6 py-12 lg:flex-row lg:px-20">
        {/* Left Sidebar Skeleton */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-28 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="mt-3 h-8 w-full rounded-lg" />
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <article className="mx-auto w-full max-w-[720px] flex-1">
          <div className="mb-8 flex flex-col space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="mt-6 h-6 w-full" />

            <div className="my-8 h-px bg-border" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>

          <Skeleton className="mb-12 aspect-video w-full rounded-2xl" />

          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </article>
      </div>
    </div>
  );
}
