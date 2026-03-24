"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import AIChatPanel from "./AIChatPanel";

export default function GlobalAIChatButton() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Hide the AI button on the editor pages
  if (pathname?.startsWith("/editor")) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence initial={false}>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
          >
            <Sparkles className="h-6 w-6" />
            {/* Pulse ring */}
            <span className="absolute inset-0 -z-10 animate-ping rounded-2xl bg-primary/20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence initial={false}>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.16 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/18 will-change-[opacity]"
            />

            {/* Panel */}
            <div className="fixed right-6 bottom-6 z-50 transform-gpu will-change-transform">
              <AIChatPanel onClose={() => setOpen(false)} mode="floating" />
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
