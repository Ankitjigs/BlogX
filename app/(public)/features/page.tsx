import { Zap, Layers, Cpu, Globe2, MoveRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <Cpu className="h-6 w-6" />,
    title: "AI-Powered Writing",
    description:
      "Draft, outline, and brainstorm faster with our context-aware AI assistant built directly into the editor. It learns your voice and helps you beat writer's block.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Block-Based Editor",
    description:
      "A distraction-free, notion-style block editor that lets you focus on your writing. Seamlessly drag, drop, and format with slash commands.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Publishing",
    description:
      "Deploy your blog to a global edge network in seconds. Your readers get a blazing fast experience no matter where they are in the world.",
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "SEO Optimization",
    description:
      "Built-in tools to help you rank higher. Generate meta tags, analyze keyword density, and preview how your post will look on social media.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white pb-24 pt-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Everything you need to build a {" "}
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              world-class blog.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            We&apos;ve thought of everything so you can focus on writing. From the
            editor experience to how your posts are delivered to the edge.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-10 transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                    {feature.icon}
                  </div>
                  <span className="text-xl">{feature.title}</span>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-32 max-w-4xl rounded-3xl bg-slate-900 px-6 py-16 shadow-2xl dark:bg-slate-800/50 sm:px-12 sm:py-20 lg:flex lg:items-center lg:justify-between lg:px-20">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start publishing?
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-slate-300">
              Join thousands of writers who are already building their audience on BlogX.
            </p>
          </div>
          <div className="mt-8 flex gap-4 lg:ml-8 lg:mt-0 lg:shrink-0">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-transparent">
                Create your blog
                <MoveRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
