"use client";

import { useEditorContext } from "./EditorContext";
import { useSyncExternalStore } from "react";
import { Keyboard, Cloud, CloudOff } from "lucide-react";

// External time store for minute-level updates (shared with navbar)
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
    }, 1000);
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

function getSaveStatusText(lastSaved: Date | null, isSaving: boolean) {
  if (isSaving) return { text: "Saving...", isRecent: true };
  if (!lastSaved) return { text: "Not saved", isRecent: false };

  const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds < 60) return { text: "Saved now", isRecent: true };
  if (minutes === 1) return { text: "Saved 1m ago", isRecent: true };
  if (minutes < 60)
    return { text: `Saved ${minutes}m ago`, isRecent: minutes < 5 };
  return { text: `Saved ${Math.floor(minutes / 60)}h ago`, isRecent: false };
}

export default function EditorFooter() {
  const { state, updateState, toggleShortcuts } = useEditorContext();
  const wordCount = state.wordCount || 0;
  const readTime = Math.ceil(wordCount / 200);

  // Subscribe to minute-level updates
  useSyncExternalStore(
    subscribeToMinutes,
    getMinuteSnapshot,
    getMinuteSnapshot,
  );
  const saveStatus = getSaveStatusText(state.lastSaved, state.isSaving);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {state.isSaving ? (
            <Cloud className="h-4 w-4 animate-pulse text-emerald-500" />
          ) : saveStatus.isRecent ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
            </>
          ) : (
            <CloudOff className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span
            className={`${saveStatus.isRecent ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}
          >
            {saveStatus.text}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {wordCount}
            </span>
            <span>words</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {readTime}
            </span>
            <span>min read</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => toggleShortcuts(true)}
          className="flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Keyboard className="h-4 w-4" />
          <span>Shortcuts</span>
        </button>
        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
        <button
          onClick={() => updateState({ isEngagedMode: !state.isEngagedMode })}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <span
            className={`transition-colors ${state.isEngagedMode ? "text-primary font-medium" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`}
          >
            Engaged Mode
          </span>
          <div
            className={`relative h-5 w-9 rounded-full transition-colors ${state.isEngagedMode ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${state.isEngagedMode ? "translate-x-4" : "translate-x-0.5"}`}
            ></div>
          </div>
        </button>
      </div>
    </div>
  );
}
