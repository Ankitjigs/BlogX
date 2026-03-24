import Link from "next/link";
import { Zap, Globe, AtSign, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 pb-10 pt-20 dark:border-[#262626]">
      <div className="mx-auto mb-16 grid max-w-[1200px] grid-cols-2 gap-10 px-6 md:grid-cols-4 lg:grid-cols-6">
        {/* Brand Column */}
        <div className="col-span-2">
          <Link href="/" className="mb-6 flex items-center gap-2 group">
            <Logo className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight">BlogX</span>
          </Link>
          <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            The next-generation publishing platform for teams and individual
            creators who care about craft.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              <Globe className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              <AtSign className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-slate-400 transition-colors hover:text-primary"
            >
              <Video className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-wider">
            Product
          </h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/features" className="transition-colors hover:text-primary">
                Features
              </Link>
            </li>
            <li>
              <Link href="/integrations" className="transition-colors hover:text-primary">
                Integrations
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="transition-colors hover:text-primary">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/templates" className="transition-colors hover:text-primary">
                Templates
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 className="mb-6 text-sm font-bold uppercase tracking-wider">
            Company
          </h4>
          <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/about" className="transition-colors hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-primary">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/careers" className="transition-colors hover:text-primary">
                Careers
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="col-span-2">
          <h4 className="mb-6 text-sm font-bold uppercase tracking-wider">
            Stay Updated
          </h4>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Subscribe for the latest product updates and writing tips.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#262626] dark:bg-[#161616]"
            />
            <Button className="rounded-lg bg-primary font-bold text-white hover:bg-primary/80 dark:bg-[#4848a6] dark:hover:bg-[#3e3e8f]">
              Join
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 border-t border-slate-100 px-6 pt-10 text-xs text-slate-400 dark:border-[#262626] md:flex-row">
        <p>© 2026 BlogX Publishing Platform Inc. All rights reserved.</p>
        <div className="flex gap-8">
          <Link
            href="/privacy"
            className="transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Terms of Service
          </Link>
          <Link
            href="/cookies"
            className="transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
