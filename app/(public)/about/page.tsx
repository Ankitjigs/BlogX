export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <p className="text-base font-semibold leading-7 text-primary">About Us</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            We&apos;re changing how the world writes
          </h1>
          <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-slate-600 dark:text-slate-400 lg:max-w-none lg:grid-cols-2">
            <div>
              <p>
                BlogX was founded on a simple premise: writing tools should get out of the way. We noticed that existing platforms were either too complex to set up, or too restrictive in what they allowed creators to do. We wanted something in the middle—a tool that felt like a quiet room for writing, but had the hidden power of a full publishing suite.
              </p>
              <p className="mt-8">
                Today, BlogX powers thousands of independent writers, tech startups, and large publications. We obsess over typography, performance, and the small details that make the writing experience delightful. Our AI tools aren&apos;t meant to replace writers; they are designed to unblock them.
              </p>
            </div>
            <div>
              <p>
                We believe that great ideas deserve great design. That&apos;s why every BlogX site looks beautiful out of the box. You shouldn&apos;t need a computer science degree to have a blazing fast, SEO-optimized blog.
              </p>
              <p className="mt-8">
                We are a remote-first team scattered across the globe, united by a passion for the written word. We&apos;re building the tool we always wished we had.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 gap-x-8 lg:grid-cols-3">
             <div className="flex flex-col border-t border-slate-200 pt-8 dark:border-slate-800">
               <dt className="text-sm font-semibold leading-6 text-slate-500">Founded</dt>
               <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">2026</dd>
             </div>
             <div className="flex flex-col border-t border-slate-200 pt-8 dark:border-slate-800">
               <dt className="text-sm font-semibold leading-6 text-slate-500">Writers</dt>
               <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">100k+</dd>
             </div>
             <div className="flex flex-col border-t border-slate-200 pt-8 dark:border-slate-800">
               <dt className="text-sm font-semibold leading-6 text-slate-500">Posts Published</dt>
               <dd className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">12M+</dd>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
