"use client";

import { useEditorContext } from "./EditorContext";
import { ReactNode, useEffect } from "react";
import { ImageUrlDialogProvider } from "./ImageUrlDialog";
import { EmojiPickerDialogProvider } from "./EmojiPickerDialog";
import ShortcutsDialog from "./ShortcutsDialog";
import ShortcutsHandler from "./ShortcutsHandler";
import EditorNavbar from "./EditorNavbar";
import EditorSidebar from "./EditorSidebar";
import EditorFooter from "./EditorFooter";

interface EditorLayoutProps {
  children: ReactNode;
}

export default function EditorLayout({ children }: EditorLayoutProps) {
  const { state, toggleShortcuts, updateState } = useEditorContext();
  const { isEngagedMode } = state;
  // Handle Escape to exit Engaged Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEngagedMode) {
        updateState({ isEngagedMode: false });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEngagedMode, updateState]);

  return (
    <ImageUrlDialogProvider>
      <EmojiPickerDialogProvider>
        <div
          className={`flex h-screen flex-col overflow-hidden font-display transition-colors duration-500 ${
            isEngagedMode
              ? "bg-[#fafaf9] text-stone-800 dark:bg-stone-950 dark:text-stone-200"
              : "bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100"
          }`}
        >
          {/* Top Navigation */}
          <header
            className={`z-50 flex h-16 items-center justify-between border-b px-6 transition-all duration-300 ${
              isEngagedMode
                ? "border-transparent bg-transparent"
                : "border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80"
            }`}
          >
            <EditorNavbar />
          </header>

          <div className="relative flex flex-1 overflow-hidden">
            {/* Main Canvas */}
            <main
              className={`flex-1 overflow-y-auto px-6 pb-40 pt-12 transition-all duration-300 ${
                isEngagedMode
                  ? "mx-auto w-full max-w-4xl no-scrollbar"
                  : "w-full custom-scrollbar"
              }`}
            >
              <div
                className={`mx-auto ${isEngagedMode ? "max-w-4xl" : "max-w-3xl"}`}
              >
                {children}
              </div>
            </main>

            {/* Sidebar Panel - Hidden in Engaged Mode */}
            {!isEngagedMode && (
              <aside className="hidden w-96 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-background-dark/50 md:flex!">
                <EditorSidebar />
              </aside>
            )}
          </div>

          {/* Bottom Footer - Hide in Engaged Mode */}
          {!isEngagedMode && (
            <footer className="flex h-10 items-center justify-between border-t border-slate-200 bg-white px-6 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:bg-background-dark">
              <EditorFooter />
            </footer>
          )}

          <ShortcutsHandler />
          <ShortcutsDialog
            open={state.isShortcutsOpen}
            onOpenChange={toggleShortcuts}
          />

          {/* Subtle Hint */}
          <div
            className={`pointer-events-none fixed bottom-6 right-8 text-xs font-medium text-slate-300 transition-opacity duration-700 dark:text-slate-700 ${
              isEngagedMode ? "opacity-100 delay-1000" : "opacity-0"
            }`}
          >
            Press Esc to exit
          </div>
        </div>
      </EmojiPickerDialogProvider>
    </ImageUrlDialogProvider>
  );
}
