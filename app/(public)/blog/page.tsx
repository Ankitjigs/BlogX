import Link from "next/link";

const posts = [
  {
    id: 1,
    title: 'Introducing BlogX AI: Your New Writing Partner',
    href: '#',
    description:
      'We are thrilled to announce our new AI integration designed to help you brainstorm, outline, and write faster than ever before without losing your unique voice.',
    date: 'Mar 16, 2026',
    datetime: '2026-03-16',
    category: { title: 'Product Updates', href: '#' },
    author: {
      name: 'Michael Foster',
      role: 'Co-Founder / CTO',
      href: '#',
    },
  },
  {
    id: 2,
    title: 'How to structure your technical blog post',
    href: '#',
    description:
      'A deep dive into the anatomy of a great technical article. From the hook to the code snippets, learn how to keep your developer audience engaged.',
    date: 'Mar 10, 2026',
    datetime: '2026-03-10',
    category: { title: 'Writing Tips', href: '#' },
    author: {
      name: 'Lindsay Walton',
      role: 'Head of Content',
      href: '#',
    },
  },
  {
    id: 3,
    title: 'The state of static site generators in 2026',
    href: '#',
    description:
      'Next.js, Astro, Remix... the landscape is crowded. Here is our take on why we chose the App Router for BlogX and what it means for your site speed.',
    date: 'Feb 24, 2026',
    datetime: '2026-02-24',
    category: { title: 'Engineering', href: '#' },
    author: {
      name: 'Tom Cook',
      role: 'Lead Engineer',
      href: '#',
    },
  },
]

export default function BlogPage() {
  return (
    <div className="bg-white py-24 sm:py-32 dark:bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">From the BlogX Team</h2>
          <p className="mt-2 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Learn how to grow your audience, improve your writing, and catch up on our latest product updates.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col items-start justify-between">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.datetime} className="text-slate-500">
                  {post.date}
                </time>
                <Link
                  href={post.category.href}
                  className="relative z-10 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {post.category.title}
                </Link>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-slate-900 group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300">
                  <Link href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{post.description}</p>
              </div>
              <div className="mt-8 flex items-center gap-x-4">
                <div className="text-sm leading-6">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    <Link href={post.author.href}>
                      <span className="absolute inset-0" />
                      {post.author.name}
                    </Link>
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{post.author.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
