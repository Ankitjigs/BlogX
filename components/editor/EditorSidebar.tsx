"use client";

import { useRef, ChangeEvent, useState } from "react";
import { useEditorContext } from "./EditorContext";
import { CategorySelector } from "./CategorySelector";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Settings,
  GalleryVerticalEnd,
  X,
  ChevronRight,
  Hash,
  Keyboard,
  Globe,
  Search,
  Loader2,
  Sparkles,
  FolderOpen,
  AlignLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import AIAssistantPanel from "./AIAssistantPanel";
import AIChatPanel from "@/components/ai-chat/AIChatPanel";

export default function EditorSidebar() {
  const { state, updateState, markDirty, post } = useEditorContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Toggle for Advanced Settings Accordion type behavior
  const [showAdvanced, setShowAdvanced] = useState(false);

  // SEO Score calculation
  const seoScore =
    (state.title ? 20 : 0) +
    (state.metaDescription && state.metaDescription.length > 50 ? 30 : 0) +
    (state.featuredImage ? 20 : 0) +
    (state.tags.length > 0 ? 15 : 0) +
    (state.wordCount > 300 ? 15 : state.wordCount > 100 ? 5 : 0);

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    toast.info("Uploading cover image...");
    const url = await uploadImage(file);
    if (url) {
      updateState({ featuredImage: url });
      markDirty();
      toast.success("Cover image uploaded!");
    } else {
      toast.error("Failed to upload cover image");
    }
    setIsUploadingImage(false);
    e.target.value = "";
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !state.tags.includes(tag)) {
        updateState({ tags: [...state.tags, tag] });
        markDirty();
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateState({ tags: state.tags.filter((t) => t !== tagToRemove) });
    markDirty();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-background-dark/50">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="flex w-full items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <GalleryVerticalEnd className="text-lg text-primary" />
            Detail & SEO
          </h2>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${seoScore > 80 ? "bg-emerald-500/10 text-emerald-500" : seoScore > 50 ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"}`}
          >
            <span>{seoScore}</span>
            <span className="text-[8px]">SCORE</span>
          </div>
        </div>
        <button
          onClick={() => setShowChat(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-primary/10 to-blue-500/10 px-3 py-2 text-xs font-semibold text-primary transition-all hover:from-primary/20 hover:to-blue-500/20"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Ask AI
        </button>
      </div>

      {/* AI Chat — always mounted, toggled via hidden to preserve messages */}
      <motion.div
        initial={false}
        animate={{ opacity: showChat ? 1 : 0, x: showChat ? 0 : 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={showChat ? "flex-1 overflow-hidden" : "hidden"}
      >
        <AIChatPanel
          onClose={() => setShowChat(false)}
          postId={post?.id}
          mode="sidebar"
        />
      </motion.div>

      {/* Sidebar content — always mounted, toggled via hidden */}
      <motion.div
        initial={false}
        animate={{ opacity: showChat ? 0 : 1, x: showChat ? -20 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={
          showChat
            ? "hidden"
            : "custom-scrollbar flex-1 space-y-10 overflow-y-auto p-6"
        }
      >
            {/* Slug Section */}
            <div className="space-y-4">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <LinkIcon className="h-3.5 w-3.5" />
                URL Slug
              </label>
              <input
                type="text"
                value={state.slug}
                onChange={(e) => {
                  updateState({ slug: e.target.value });
                  markDirty();
                }}
                className="w-full rounded-lg border-none bg-slate-100 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:text-slate-100"
              />
              <p className="text-[10px] text-slate-400">
                blogx.com/posts/{state.slug || "..."}
              </p>
            </div>

            {/* Category Section */}
            <div className="space-y-4">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <FolderOpen className="h-3.5 w-3.5" />
                Category
              </label>
              <CategorySelector
                selectedId={state.categoryId}
                onSelect={(id) => {
                  updateState({ categoryId: id });
                  markDirty();
                }}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <Hash className="h-3.5 w-3.5" />
                Tags
              </label>
              <div className="group rounded-lg border border-slate-200 bg-white p-2 transition-all focus-within:ring-2 focus-within:ring-primary/50 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap gap-2">
                  {state.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder={state.tags.length === 0 ? "Add a tag..." : ""}
                    className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-4">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <AlignLeft className="h-3.5 w-3.5" />
                Excerpt
              </label>
              <textarea
                value={state.excerpt}
                onChange={(e) => {
                  updateState({ excerpt: e.target.value });
                  markDirty();
                }}
                className="w-full resize-none rounded-lg border-none bg-slate-100 px-3 py-2 text-sm text-slate-900 transition-all focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Brief summary for post listings..."
                rows={6}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-4">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                <ImageIcon className="h-3.5 w-3.5" />
                Featured Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                {state.featuredImage ? (
                  <>
                    <img
                      src={state.featuredImage}
                      className="h-full w-full object-cover"
                      alt="Cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          updateState({ featuredImage: null });
                          markDirty();
                        }}
                        className="rounded-full bg-white p-2 text-red-500 shadow-lg hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (!isUploadingImage) {
                        fileInputRef.current?.click();
                      }
                    }}
                    disabled={isUploadingImage}
                    className="flex flex-col items-center gap-2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed dark:hover:text-slate-300"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <ImageIcon className="h-8 w-8" />
                    )}
                    <span className="text-xs font-medium">
                      {isUploadingImage ? "Uploading..." : "Add Cover Image"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Settings Section */}
            <div className="space-y-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors pb-2 border-b border-slate-100 dark:border-slate-800"
              >
                <span>Advanced SEO</span>
                <Settings
                  className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false} mode="wait">
                {showAdvanced && (
                  <motion.div
                    key="advanced-seo"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformOrigin: "top", overflow: "hidden" }}
                  >
                    <div className="space-y-6 pt-2">
                      {/* Meta Title */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Globe className="h-3 w-3" />
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={state.metaTitle}
                          onChange={(e) => {
                            updateState({ metaTitle: e.target.value });
                            markDirty();
                          }}
                          placeholder={state.title}
                          className="w-full rounded-lg border-none bg-slate-100 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <Search className="h-3 w-3" />
                          Meta Description
                        </label>
                        <textarea
                          value={state.metaDescription}
                          onChange={(e) => {
                            updateState({ metaDescription: e.target.value });
                            markDirty();
                          }}
                          className="w-full resize-none rounded-lg border-none bg-slate-100 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:text-slate-100"
                          placeholder="Custom description for search engines..."
                          rows={3}
                        />
                      </div>

                      {/* Canonical URL */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                          <LinkIcon className="h-3 w-3" />
                          Canonical URL
                        </label>
                        <input
                          type="text"
                          value={state.canonicalUrl}
                          onChange={(e) => {
                            updateState({ canonicalUrl: e.target.value });
                            markDirty();
                          }}
                          placeholder="https://..."
                          className="w-full rounded-lg border-none bg-slate-100 px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-primary/50 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Preview */}
              {!showAdvanced && (
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Globe className="h-3.5 w-3.5" />
                    Search Result Preview
                  </label>
                  <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="truncate max-w-[150px]">
                        {state.canonicalUrl || "blogx.com"}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                      <span>stories</span>
                    </div>
                    <div className="cursor-pointer text-sm font-medium text-blue-500 hover:underline line-clamp-1">
                      {state.metaTitle || state.title || "Untitled Post"} |
                      BlogX
                    </div>
                    <div className="line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {state.metaDescription ||
                        state.excerpt ||
                        "Discover how minimalist writing interfaces enhance the creative flow and why BlogX is leading the charge in distraction-free blogging."}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Assistant */}
            <AIAssistantPanel />
          </motion.div>
    </div>
  );
}
