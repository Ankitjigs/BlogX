"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Hash,
  Link2,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateFieldSuggestions,
  generatePublishChecks,
  rewriteSelection,
} from "@/actions/ai";
import { useEditorContext } from "./EditorContext";
import type { EditorSuggestionField, PublishChecks } from "@/types/llm";
import { toast } from "sonner";

const FIELD_CONFIG: Array<{
  field: EditorSuggestionField;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    field: "slug",
    label: "URL slug",
    description: "Sharper permalink for search and sharing",
    icon: Link2,
    color: "text-sky-500",
  },
  {
    field: "tags",
    label: "Tags",
    description: "Topical labels readers and search engines can parse",
    icon: Hash,
    color: "text-violet-500",
  },
  {
    field: "excerpt",
    label: "Excerpt",
    description: "Short deck for feeds, previews, and cards",
    icon: AlignLeft,
    color: "text-amber-500",
  },
  {
    field: "metaTitle",
    label: "Meta title",
    description: "Search result headline with tighter intent",
    icon: Type,
    color: "text-emerald-500",
  },
  {
    field: "metaDescription",
    label: "Meta description",
    description: "Search snippet that earns the click",
    icon: Search,
    color: "text-fuchsia-500",
  },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AIAssistantPanel() {
  const { state, updateState, markDirty, editor, post } = useEditorContext();
  const [checks, setChecks] = useState<PublishChecks | null>(null);
  const [rewriteInstruction, setRewriteInstruction] = useState(
    "Make this clearer and concise.",
  );
  const [selectedText, setSelectedText] = useState("");
  const [pendingField, setPendingField] =
    useState<EditorSuggestionField | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [fieldSuggestions, setFieldSuggestions] = useState<
    Partial<Record<EditorSuggestionField, string[]>>
  >({});

  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      if (from === to) {
        setSelectedText("");
        return;
      }
      setSelectedText(editor.state.doc.textBetween(from, to, " ").trim());
    };

    updateSelection();
    editor.on("selectionUpdate", updateSelection);
    editor.on("update", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("update", updateSelection);
    };
  }, [editor]);

  const readyFieldCount = useMemo(
    () =>
      FIELD_CONFIG.reduce((count, item) => {
        const preview = getFieldPreview(item.field, state);
        return preview ? count + 1 : count;
      }, 0),
    [state],
  );

  const clearFieldSuggestions = (field: EditorSuggestionField) => {
    setFieldSuggestions((prev) => ({ ...prev, [field]: [] }));
  };

  const applyFieldSuggestion = (
    field: EditorSuggestionField,
    value: string,
  ) => {
    const cleaned = value.trim();
    if (!cleaned) return;

    if (field === "slug") {
      updateState({ slug: normalizeSlug(cleaned) });
      markDirty();
      clearFieldSuggestions(field);
      toast.success("Slug suggestion applied");
      return;
    }

    if (field === "tags") {
      if (state.tags.includes(cleaned)) return;
      updateState({ tags: [...state.tags, cleaned] });
      markDirty();
      clearFieldSuggestions(field);
      toast.success("Tag suggestion applied");
      return;
    }

    if (field === "excerpt") {
      updateState({ excerpt: cleaned });
      markDirty();
      clearFieldSuggestions(field);
      toast.success("Excerpt suggestion applied");
      return;
    }

    if (field === "metaTitle") {
      updateState({ metaTitle: cleaned });
      markDirty();
      clearFieldSuggestions(field);
      toast.success("Meta title suggestion applied");
      return;
    }

    if (field === "metaDescription") {
      updateState({ metaDescription: cleaned });
      markDirty();
      clearFieldSuggestions(field);
      toast.success("Meta description suggestion applied");
    }
  };

  const runFieldSuggestion = async (field: EditorSuggestionField) => {
    if (!post?.id) return;
    setPendingField(field);

    try {
      const data = await generateFieldSuggestions({ postId: post.id, field });
      setFieldSuggestions((prev) => ({ ...prev, [field]: data.suggestions }));
      toast.success(
        `${FIELD_CONFIG.find((item) => item.field === field)?.label || "Field"} suggestions generated`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate suggestions"));
    } finally {
      setPendingField(null);
    }
  };

  const runRewriteSelection = async () => {
    if (!post?.id || !editor || !selectedText) return;
    setIsRewriting(true);

    try {
      const data = await rewriteSelection({
        postId: post.id,
        selectedText,
        instruction: rewriteInstruction,
      });
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor
          .chain()
          .focus()
          .insertContentAt({ from, to }, data.rewrittenText)
          .run();
        markDirty();
        toast.success("Selection rewritten");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to rewrite selection"));
    } finally {
      setIsRewriting(false);
    }
  };

  const runPublishChecks = async () => {
    if (!post?.id) return;
    setIsChecking(true);

    try {
      const data = await generatePublishChecks(post.id);
      setChecks(data);
      toast.success("Publish checks generated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to generate publish checks"));
    } finally {
      setIsChecking(false);
    }
  };

  const applyIssueFix = (field?: string, value?: string) => {
    if (!field || !value) return;
    if (
      field !== "title" &&
      field !== "excerpt" &&
      field !== "metaTitle" &&
      field !== "metaDescription"
    ) {
      return;
    }
    applyFieldSuggestion(field, value);
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex items-center gap-2.5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Copilot
            </p>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Aware
            </span>
          </div>
          <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
            One-click metadata passes, contextual rewrites, and pre-publish
            guidance.
          </p>
        </div>
      </motion.div>

      {/* Status strip */}
      <div className="grid grid-cols-3 gap-1.5">
        <StatusChip label="Fields" value={`${readyFieldCount}/5`} />
        <StatusChip
          label="Selection"
          value={selectedText ? "Live" : "Idle"}
          active={!!selectedText}
        />
        <StatusChip
          label="Checks"
          value={checks ? `${checks.score}` : "Pending"}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Field cards */}
      <div className="space-y-2">
        {FIELD_CONFIG.map((item, index) => (
          <FieldCard
            key={item.field}
            icon={item.icon}
            label={item.label}
            description={item.description}
            color={item.color}
            currentValue={getFieldPreview(item.field, state)}
            suggestions={fieldSuggestions[item.field] || []}
            isPending={pendingField === item.field}
            index={index}
            onSuggest={() => void runFieldSuggestion(item.field)}
            onApply={(value) => applyFieldSuggestion(item.field, value)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Selection rewrite */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Rewrite
          </p>
        </div>
        <Input
          value={rewriteInstruction}
          onChange={(e) => setRewriteInstruction(e.target.value)}
          placeholder="Rewrite instruction…"
          className="h-9 border-slate-200/80 bg-slate-50/80 text-xs shadow-none dark:border-slate-800/80 dark:bg-slate-900/60"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {selectedText
              ? `${selectedText.split(/\s+/).filter(Boolean).length} words`
              : "Select text first"}
          </span>
          <Button
            size="sm"
            disabled={isRewriting || !selectedText || !post?.id}
            onClick={() => void runRewriteSelection()}
            className="h-7 rounded-md bg-slate-900 px-2.5 text-[11px] font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {isRewriting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Wand2 className="mr-1 h-3 w-3" />
                Rewrite
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Publish checks */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Checks
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={isChecking || !post?.id}
            onClick={() => void runPublishChecks()}
            className="h-7 rounded-md border-slate-200/80 px-2.5 text-[11px] font-medium dark:border-slate-700"
          >
            {isChecking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Run"
            )}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {checks ? (
            <motion.div
              key="publish-checks"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mb-2.5 flex items-center justify-between rounded-lg bg-slate-50/80 px-3 py-2 dark:bg-slate-900/60">
                <span className="text-xs font-medium text-slate-500">
                  Health
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {checks.score}/100
                </span>
              </div>
              <div className="space-y-2">
                {checks.issues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-slate-100 bg-white/80 p-3 dark:border-slate-800/60 dark:bg-slate-950/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-snug text-slate-900 dark:text-slate-50">
                        {issue.title}
                      </p>
                      <span
                        className={cn(
                          "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          issue.severity === "high" &&
                            "bg-red-500/10 text-red-600 dark:text-red-400",
                          issue.severity === "medium" &&
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          issue.severity === "low" &&
                            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {issue.why}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                      {issue.suggestedFix}
                    </p>
                    {issue.field && issue.suggestedValue ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2.5 h-7 rounded-md px-2.5 text-[11px]"
                        onClick={() =>
                          applyIssueFix(issue.field, issue.suggestedValue)
                        }
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Apply fix
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function getFieldPreview(
  field: EditorSuggestionField,
  state: {
    slug: string;
    tags: string[];
    excerpt: string;
    metaTitle: string;
    metaDescription: string;
  },
) {
  switch (field) {
    case "slug":
      return state.slug;
    case "tags":
      return state.tags.join(", ");
    case "excerpt":
      return state.excerpt;
    case "metaTitle":
      return state.metaTitle;
    case "metaDescription":
      return state.metaDescription;
    default:
      return "";
  }
}

function StatusChip({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-2 py-2 text-center dark:bg-slate-900/50">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs font-bold",
          active ? "text-primary" : "text-slate-800 dark:text-slate-200",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FieldCard(props: {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  currentValue: string;
  suggestions: string[];
  isPending: boolean;
  index: number;
  onSuggest: () => void;
  onApply: (value: string) => void;
}) {
  const Icon = props.icon;
  const [expanded, setExpanded] = useState(false);
  const hasSuggestions = props.suggestions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.15,
        delay: props.index * 0.03,
        ease: "easeOut",
      }}
      className="rounded-xl border border-slate-200/80 bg-white/90 dark:border-slate-800/70 dark:bg-slate-950/60"
    >
      {/* Top row: icon + label + badge + suggest */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Icon className={cn("h-4 w-4 shrink-0", props.color)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-100">
              {props.label}
            </span>
            {props.currentValue ? (
              <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Ready
              </span>
            ) : (
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                Empty
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 shrink-0 gap-1 px-2 text-[11px] font-medium text-primary hover:bg-primary/5 hover:text-primary"
          disabled={props.isPending}
          onClick={props.onSuggest}
        >
          {props.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              Suggest
            </>
          )}
        </Button>
      </div>

      {/* Description */}
      <div className="px-3 pb-2">
        <p className="text-[11px] leading-snug text-slate-400 dark:text-slate-500">
          {props.description}
        </p>
      </div>

      {/* Current value (collapsible) */}
      {props.currentValue && (
        <div className="border-t border-slate-100 dark:border-slate-800/60">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current
            </span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="current-value"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="break-all px-3 pb-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {props.currentValue}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Suggestions */}
      <AnimatePresence initial={false}>
        {hasSuggestions && (
          <motion.div
            key={`${props.label}-suggestions`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden border-t border-primary/10 bg-primary/2"
          >
            <div className="space-y-1.5 px-3 py-2.5">
              {props.suggestions.map((value, index) => (
                <motion.div
                  key={`${props.label}-${value}-${index}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12, delay: index * 0.03 }}
                  className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-2.5 dark:border-slate-800/50 dark:bg-slate-950/70"
                >
                  <p className="min-w-0 flex-1 break-all text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                    {value}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 rounded-md border-primary/20 px-2.5 text-[11px] font-medium text-primary hover:bg-primary/5"
                    onClick={() => props.onApply(value)}
                  >
                    Apply
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
