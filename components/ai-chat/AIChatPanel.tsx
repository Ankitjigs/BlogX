"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import MarkdownIt from "markdown-it";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, Send, Sparkles, FileText, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/llm";

interface AIChatPanelProps {
  onClose: () => void;
  postId?: string;
  mode: "sidebar" | "floating";
}

const PRESETS = [
  { label: "Improve SEO", prompt: "How can I improve the SEO of this post?" },
  { label: "Suggest title", prompt: "Suggest 3 better titles for this post." },
  { label: "Make shorter", prompt: "How can I make this post more concise?" },
  {
    label: "Add hook",
    prompt: "Write a compelling opening hook for this post.",
  },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

const defaultLinkOpen =
  markdown.renderer.rules.link_open ??
  ((tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options));

markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  token.attrSet("target", "_blank");
  token.attrSet("rel", "noopener noreferrer");
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export default function AIChatPanel({
  onClose,
  postId,
  mode,
}: AIChatPanelProps) {
  const prefersReducedMotion = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content: content.trim(),
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          })),
          postId,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: accumulated };
                  }
                  return copy;
                });
              }
              if (parsed.error) {
                accumulated = "Sorry, something went wrong. Please try again.";
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last && last.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: accumulated };
                  }
                  return copy;
                });
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.role === "assistant") {
          copy[copy.length - 1] = {
            ...last,
            content:
              "Failed to connect. Please check your connection and try again.",
          };
        }
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const isSidebar = mode === "sidebar";
  const floatingInitial = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 16 };
  const floatingExit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 12 };
  const floatingTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div
      initial={isSidebar ? { opacity: 0, x: 20 } : floatingInitial}
      animate={isSidebar ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
      exit={isSidebar ? { opacity: 0, x: 20 } : floatingExit}
      transition={
        isSidebar
          ? { type: "spring", damping: 25, stiffness: 300 }
          : floatingTransition
      }
      className={cn(
        "flex transform-gpu flex-col overflow-hidden",
        isSidebar
          ? "h-full bg-white dark:bg-background-dark/50"
          : "h-130 w-95 will-change-transform rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:bg-slate-950",
      )}
    >
      <div className="h-1 w-full bg-linear-to-r from-primary via-blue-500 to-cyan-400" />

      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-blue-500/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Bloggy AI
            </h3>
            <div className="flex items-center gap-1">
              {postId ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-2.5 w-2.5" />
                  Reading your draft
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  General assistant
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <EmptyState
            hasPostContext={!!postId}
            onPresetClick={(prompt) => void sendMessage(prompt)}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: i === messages.length - 1 ? 0 : 0,
                  }}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="flex max-w-[85%] gap-2">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/15 to-blue-500/10">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800/60 dark:bg-slate-900/60">
                        {msg.content ? (
                          <MarkdownMessage content={msg.content} />
                        ) : (
                          <TypingIndicator />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-linear-to-r from-primary/10 to-blue-500/10 px-3.5 py-2.5 dark:bg-slate-100">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700 dark:text-slate-900">
                        {msg.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/30">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 transition-all focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 dark:border-slate-700 dark:bg-slate-900">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            style={{ minHeight: "20px", maxHeight: "120px" }}
            className="custom-scrollbar flex-1 resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
              input.trim() && !isStreaming
                ? "bg-linear-to-br from-primary to-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
            )}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </motion.div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none break-words text-[13px] leading-relaxed text-slate-700 prose-headings:my-2 prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary/40 prose-blockquote:text-slate-600 dark:prose-invert dark:text-slate-200 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:px-3 [&_pre]:py-2 [&_pre]:text-slate-100 [&_code]:rounded [&_code]:bg-slate-200/70 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:font-medium [&_code]:text-slate-800 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:font-normal dark:[&_code]:bg-slate-800/80 dark:[&_code]:text-slate-100"
      dangerouslySetInnerHTML={{ __html: markdown.render(content) }}
    />
  );
}

function EmptyState({
  hasPostContext,
  onPresetClick,
}: {
  hasPostContext: boolean;
  onPresetClick: (prompt: string) => void;
}) {
  const presets = hasPostContext
    ? PRESETS
    : [
        {
          label: "Blogging tips",
          prompt:
            "What are the best practices for writing engaging blog posts?",
        },
        {
          label: "SEO basics",
          prompt: "Explain the fundamentals of SEO for blog content.",
        },
        {
          label: "Content strategy",
          prompt: "Help me create a content calendar for my blog.",
        },
        {
          label: "Writing style",
          prompt: "How can I develop a unique writing voice for my blog?",
        },
      ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/15 to-blue-500/10"
      >
        <Sparkles className="h-7 w-7 text-primary" />
      </motion.div>
      <h4 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
        {hasPostContext
          ? "How can I help with your post?"
          : "How can I help you?"}
      </h4>
      <p className="mb-5 text-center text-xs text-slate-400 dark:text-slate-500">
        {hasPostContext
          ? "I've read your draft and can help you improve it."
          : "Ask me anything about blogging, SEO, or content."}
      </p>
      <div className="grid w-full grid-cols-2 gap-2">
        {presets.map((p) => (
          <motion.button
            key={p.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPresetClick(p.prompt)}
            className="cursor-pointer rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left text-xs font-medium text-slate-600 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-primary/30 dark:hover:bg-primary/5"
          >
            {p.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/50"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
