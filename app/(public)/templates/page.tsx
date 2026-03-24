import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const templates = [
  {
    name: "Minimalist Starter",
    category: "Personal Blog",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
    description: "A clean, distraction-free template for writers who want their words to take center stage.",
  },
  {
    name: "Tech Publication",
    category: "Magazine",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=800&auto=format&fit=crop",
    description: "Perfect for tech news, tutorials, and structured multi-author publications.",
  },
  {
    name: "Portfolio Theme",
    category: "Portfolio",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
    description: "Showcase your case studies alongside your thoughts with this image-heavy theme.",
  },
  {
    name: "Startup Update",
    category: "Changelog",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    description: "Keep your users informed with a chronological, easy-to-read changelog layout.",
  },
  {
    name: "Newsletter First",
    category: "Newsletter",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop",
    description: "Optimized for conversions with prominent subscribe boxes and sparse navigation.",
  },
  {
    name: "Documentation",
    category: "Docs",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    description: "A robust template for creating beautiful, searchable product documentation.",
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 sm:py-32 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Start with a beautiful foundation
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Choose from our collection of professionally designed templates. Fully customizable and optimized for performance.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.name} className="group relative flex flex-col items-start justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg dark:bg-slate-900/50 dark:ring-slate-800">
              <div className="relative w-full">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 sm:aspect-[2/1] lg:aspect-[3/2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.image}
                    alt={template.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-slate-900/10 dark:ring-white/10" />
              </div>
              <div className="max-w-xl">
                <div className="mt-6 flex items-center gap-x-4">
                  <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    {template.category}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary">
                    <Link href="#">
                      <span className="absolute inset-0" />
                      {template.name}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {template.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex w-full items-center justify-between border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary">
                  Preview Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
