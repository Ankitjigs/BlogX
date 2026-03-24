export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {/* Social Links Placeholder */}
          <span className="text-neutral-400 hover:text-neutral-500 cursor-pointer">
            Twitter
          </span>
          <span className="text-neutral-400 hover:text-neutral-500 cursor-pointer">
            GitHub
          </span>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-neutral-500">
            &copy; 2026 BlogX Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
