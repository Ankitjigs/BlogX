import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-24 hero-gradient">
      <div className="mx-auto max-w-[1200px] px-6 text-center relative z-10">
        {/* Version Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
          V2.0 IS NOW LIVE
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 text-6xl font-black tracking-tight md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-500">
          Write. Publish. Inspire.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
          Experience the premium blogging platform built for the modern creator.
          Focused on reading comfort, high-end typography, and seamless
          workflows.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row!">
          <Link href="/editor">
            <Button
              size="lg"
              className="h-14 w-full sm:w-auto rounded-xl bg-primary px-8 text-base font-bold shadow-xl shadow-primary/20 transition-transform hover:scale-105 hover:bg-primary/90"
            >
              Start Writing Free
            </Button>
          </Link>
          <Link href="#featured">
            <Button
              variant="outline"
              size="lg"
              className="group h-14 w-full sm:w-auto rounded-xl border-slate-200 bg-white px-8 text-base font-bold transition-colors hover:bg-slate-50 dark:border-[#262626] dark:bg-[#161616] dark:hover:bg-neutral-800"
            >
              Explore Blogs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Hero Mockup */}
        <div className="mx-auto mt-20 max-w-5xl rounded-2xl border border-slate-200 bg-slate-100 p-2 shadow-2xl dark:border-[#262626] dark:bg-neutral-900">
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-background to-primary/10">
            <div className="flex h-full w-full items-center justify-center">
              {/* Simulated Editor Interface */}
              <div className="w-full max-w-2xl p-8">
                {/* Editor Header Mock */}
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>
                {/* Editor Content Mock */}
                <div className="space-y-4 text-left">
                  <div className="h-8 w-3/4 rounded bg-foreground/10"></div>
                  <div className="h-4 w-full rounded bg-foreground/5"></div>
                  <div className="h-4 w-5/6 rounded bg-foreground/5"></div>
                  <div className="h-4 w-4/5 rounded bg-foreground/5"></div>
                  <div className="mt-6 h-32 w-full rounded-lg bg-gradient-to-r from-primary/20 to-primary/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
