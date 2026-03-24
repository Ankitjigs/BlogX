import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommunityCTA() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary p-12 text-center text-white">
        {/* Background Icon */}
        <div className="pointer-events-none absolute right-0 top-0 p-20 opacity-10">
          <Sparkles className="h-[200px] w-[200px]" />
        </div>

        <h2 className="mb-6 text-4xl font-black">Ready to share your story?</h2>
        <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-blue-100">
          Join 50,000+ writers who are building their personal brands on the
          most beautiful publishing platform on the web.
        </p>

        <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:flex-row!">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 w-full sm:w-auto! rounded-xl bg-white px-10 font-bold text-primary shadow-xl transition-transform hover:scale-105 hover:bg-slate-100"
            >
              Create your blog
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-full sm:w-auto! rounded-xl border-white/30 bg-primary/20 px-10 font-bold text-white transition-colors hover:bg-primary/30"
          >
            Talk to Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
