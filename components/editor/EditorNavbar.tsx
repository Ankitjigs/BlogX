"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Cloud, CloudOff, ArrowLeft, Check } from "lucide-react";
import { useEditorContext } from "./EditorContext";
import { UserMenu } from "@/components/layout/UserMenu";
import Link from "next/link";

interface SaveStatus {
  text: string;
  isRecent: boolean;
}

function calculateStatus(lastSaved: Date | null): SaveStatus {
  if (!lastSaved) return { text: "Not saved", isRecent: false };

  const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds < 60) return { text: "Saved now", isRecent: true };
  if (minutes === 1) return { text: "Saved 1m ago", isRecent: true };
  if (minutes < 60)
    return { text: `Saved ${minutes}m ago`, isRecent: minutes < 5 };
  return { text: `Saved ${Math.floor(minutes / 60)}h ago`, isRecent: false };
}

// External time store for minute-level updates
let listeners: (() => void)[] = [];
let intervalId: NodeJS.Timeout | null = null;
let currentMinute = Math.floor(Date.now() / 60000);

function startInterval() {
  if (!intervalId) {
    intervalId = setInterval(() => {
      const newMinute = Math.floor(Date.now() / 60000);
      if (newMinute !== currentMinute) {
        currentMinute = newMinute;
        listeners.forEach((l) => l());
      }
    }, 1000); // Check every second for minute change
  }
}

function subscribeToMinutes(callback: () => void) {
  listeners.push(callback);
  startInterval();
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    if (listeners.length === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getMinuteSnapshot() {
  return currentMinute;
}

function useSaveStatus(lastSaved: Date | null, isSaving: boolean): SaveStatus {
  // Subscribe to minute-level time updates (this causes re-render every minute)
  useSyncExternalStore(
    subscribeToMinutes,
    getMinuteSnapshot,
    getMinuteSnapshot,
  );

  // Since lastSaved is a prop, the component re-renders when it changes
  // No need for useEffect
  if (isSaving) return { text: "Saving...", isRecent: true };
  return calculateStatus(lastSaved);
}

export default function EditorNavbar() {
  const { state, savePost, updateState, isDirty } = useEditorContext();
  const saveStatus = useSaveStatus(state.lastSaved, state.isSaving);

  return (
    <div className="flex w-full items-center justify-between transition-all duration-300">
      {/* ENGAGED MODE */}
      {state.isEngagedMode ? (
        <>
          {/* Left: Exit Engaged Mode */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="group gap-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              onClick={() => updateState({ isEngagedMode: false })}
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Exit Engaged Mode</span>
            </Button>
          </div>

          {/* Right: Minimal Actions */}
          <div className="flex items-center gap-4">
            {/* Minimal Save Status */}
            <div
              className={`flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition-opacity duration-1000 dark:text-emerald-400 ${
                !state.isSaving && saveStatus.isRecent
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </div>

            <Button
              size="sm"
              className="h-8 rounded-full px-4 font-semibold shadow-sm transition-all bg-[#607afb]! text-white! hover:bg-[#4f6ef0]! border-transparent!"
              onClick={() => savePost(true)}
            >
              {state.publishStatus === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </>
      ) : (
        /* NORMAL MODE */
        <>
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold leading-none text-white">
                  B
                </span>
              </div>
              <span className="hidden text-lg font-bold tracking-tight md:block!">
                BlogX
              </span>
            </Link>
            <div className="mx-2 h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/dashboard/posts"
                className="hidden transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 sm:inline!"
              >
                My Posts
              </Link>
              <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:inline!" />
              <span className="font-medium text-slate-900 dark:text-slate-200">
                {state?.title || "Untitled Draft"}
              </span>
              <span className="ml-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
                {state?.publishStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save Status - Always visible */}
            <div
              className={`mr-2 hidden items-center gap-2 text-xs lg:flex! ${
                saveStatus.isRecent
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              {state.isSaving ? (
                <Cloud className="h-4 w-4 animate-pulse" />
              ) : saveStatus.isRecent ? (
                <Cloud className="h-4 w-4" />
              ) : (
                <CloudOff className="h-4 w-4" />
              )}
              <span className={state.isSaving ? "animate-pulse" : ""}>
                {saveStatus.text}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg px-3 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  const slug = state?.slug || "";
                  if (slug) {
                    window.open(`/posts/${slug}`, "_blank");
                  }
                }}
              >
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg px-3 font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={() => savePost(false)}
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-primary px-5 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90"
                onClick={() => savePost(true)}
              >
                {state.publishStatus === "published" ? "Update" : "Publish"}
              </Button>
              <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
              <UserMenu />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
