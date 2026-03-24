"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { CookieSettingsModal } from "@/components/ui/cookie-settings-modal";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("blogx-cookie-consent");
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("blogx-cookie-consent", "all");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("blogx-cookie-consent", "essential");
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:p-0"
        >
          <div className="relative mx-auto w-full max-w-[420px] rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/90 dark:shadow-slate-900/50">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <span className="text-xl">🍪</span>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                We use cookies
              </h3>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              BlogX uses cookies to improve your browsing experience, analyze site
              traffic, and personalize content. You can accept all cookies or
              manage your preferences.
              <Link
                href="/cookies"
                className="ml-1 inline-flex items-center text-primary hover:underline"
              >
                Learn more
              </Link>
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleAcceptAll}
                className="w-full bg-primary font-medium text-white shadow-sm hover:bg-primary/90"
              >
                Accept All
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="w-full border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                >
                  Reject Non-Essential
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                >
                  Customize
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      <CookieSettingsModal
        open={isSettingsOpen}
        onOpenChange={(open) => {
          setIsSettingsOpen(open);
          if (!open && localStorage.getItem("blogx-cookie-consent")) {
            setIsVisible(false);
          }
        }}
      />
    </>
  );
}
