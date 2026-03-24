"use client";

import { BubbleMenu, Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Heading1,
  Quote,
  Code,
  Loader2,
  Underline as UnderlineIcon,
  Highlighter,
  Palette,
  List,
  ListOrdered,
  StickyNote,
  Type as TypeIcon,
  Smile,
  Sparkles,
  Check,
} from "lucide-react";
import { useState, useCallback, useRef, useTransition, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BULLET_LIST_STYLES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  ORDERED_LIST_STYLES,
  TEXT_COLORS,
} from "./editor-constants";
import { toast } from "sonner";
import { createPrivateNote } from "@/actions/private-notes";
import { rewriteSelection } from "@/actions/ai";
import { useEditorContext } from "./EditorContext";
import { EmojiPickerPanel, useEmojiDialogOpen } from "./EmojiPickerDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function ToolbarTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}
export default function EditorBubbleMenu({
  editor,
  onNoteSaved,
}: {
  editor: Editor | null;
  onNoteSaved: (note: { id: string; content: string }) => void;
}) {
  const { post, savePost } = useEditorContext();
  const isEmojiDialogOpen = useEmojiDialogOpen();
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [isBulletListOpen, setIsBulletListOpen] = useState(false);
  const [isOrderedListOpen, setIsOrderedListOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSavingNote, startSavingNote] = useTransition();
  const [isRewritingSelection, startRewritingSelection] = useTransition();
  const selectionRef = useRef<{ from: number; to: number } | null>(null);

  const storeSelection = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from !== to) {
      selectionRef.current = { from, to };
      return;
    }

    // If there's no selection (e.g. cursor inside a heading), apply to the
    // full text block so bubble/toolbar actions still work.
    const $from = editor.state.selection.$from;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === "heading" || node.type.name === "paragraph") {
        selectionRef.current = { from: $from.start(depth), to: $from.end(depth) };
        return;
      }
    }

    selectionRef.current = { from, to };
  }, [editor]);

  const applyToSelection = useCallback(
    (
      apply: (
        chain: ReturnType<Editor["chain"]>,
      ) => ReturnType<Editor["chain"]>,
      options?: { focus?: boolean },
    ) => {
      if (!editor) return;
      let chain = editor.chain();
      if (options?.focus !== false) {
        chain = chain.focus();
      }
      if (selectionRef.current) {
        chain = chain.setTextSelection(selectionRef.current);
      }
      apply(chain).run();
    },
    [editor],
  );

  const setLink = useCallback(() => {
    applyToSelection((chain) => {
      if (linkUrl) {
        return chain.extendMarkRange("link").setLink({ href: linkUrl });
      }
      return chain.unsetLink();
    });
    setIsLinkOpen(false);
  }, [applyToSelection, linkUrl]);

  const getStoredSelectionText = () => {
    if (!editor || !selectionRef.current) return "";
    return editor.state.doc
      .textBetween(selectionRef.current.from, selectionRef.current.to, " ")
      .trim();
  };

  const runAiRewrite = (instruction: string) => {
    if (!post?.id || !editor) {
      toast.error("Missing post reference");
      return;
    }

    storeSelection();
    const selectedText = getStoredSelectionText();
    if (!selectedText) {
      toast.error("Select some text first");
      return;
    }

    startRewritingSelection(async () => {
      try {
        const result = await rewriteSelection({
          postId: post.id,
          selectedText,
          instruction,
        });
        if (!selectionRef.current) return;
        editor
          .chain()
          .focus()
          .insertContentAt(selectionRef.current, result.rewrittenText)
          .run();
        setIsAiOpen(false);
        toast.success("Selection updated");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to rewrite selection";
        toast.error(message);
      }
    });
  };

  if (!editor) {
    return null;
  }

  const activeColor = editor.getAttributes("textStyle").color || "";
  const activeHighlight = editor.getAttributes("highlight").color || "";
  const activeFontSize = editor.getAttributes("textStyle").fontSize || "";

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, maxWidth: 600, zIndex: 9999 }}
      shouldShow={({ editor, from, to }) => {
        // Keep open while dialogs/popovers are active
        if (
          isLinkOpen ||
          isColorOpen ||
          isHighlightOpen ||
          isBulletListOpen ||
          isOrderedListOpen ||
          isCommentOpen ||
          isEmojiOpen ||
          isAiOpen
        ) {
          return true;
        }
        if (isEmojiDialogOpen) return false;
        if (editor.isActive("image")) return false;
        if (from !== to) return true;
        return editor.isActive("heading");
      }}
      className="editor-bubble-menu flex -translate-y-8 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl dark:border-slate-700/50 dark:bg-slate-900 dark:text-white"
    >
      {isLinkOpen ? (
        <div className="flex items-center gap-2 rounded bg-slate-100 p-1 dark:bg-slate-800">
          <input
            type="text"
            placeholder="https://"
            className="h-8 w-40 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none dark:text-white"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setLink();
            }}
            autoFocus
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={setLink}
            className="text-xs font-bold text-primary hover:opacity-80"
          >
            APPLY
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (selectionRef.current) {
                editor
                  .chain()
                  .focus()
                  .setTextSelection(selectionRef.current)
                  .run();
              }
              setIsLinkOpen(false);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-300"
          >
            CANCEL
          </button>
        </div>
      ) : (
        <>
          <ToolbarTooltip label="Bold">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleBold());
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("bold") &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <Bold className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Italic">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleItalic());
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("italic") &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <Italic className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Underline">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleUnderline());
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("underline") &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <UnderlineIcon className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Add link">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                const previousUrl = editor.getAttributes("link").href;
                setLinkUrl(previousUrl || "");
                setIsLinkOpen(true);
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("link") && "text-primary",
              )}
            >
              <LinkIcon className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <Popover
            open={isEmojiOpen}
            onOpenChange={(open) => {
              setIsEmojiOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Insert emoji">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="Insert emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-[320px] p-2">
              <EmojiPickerPanel
                height={320}
                onSelect={(emoji) => {
                  applyToSelection((chain) => chain.insertContent(emoji));
                  setIsEmojiOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <ToolbarTooltip label="Font size">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                    activeFontSize && "text-primary",
                  )}
                  aria-label="Font size"
                >
                  <TypeIcon className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-44 p-2">
              <div className="space-y-1">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    applyToSelection((chain) => chain.unsetFontSize(), {
                      focus: false,
                    })
                  }
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    <span>Default</span>
                    {!activeFontSize ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : null}
                  </div>
                </button>
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      applyToSelection(
                        (chain) => chain.setFontSize(size.value),
                        { focus: false },
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <div className="flex items-center gap-2">
                      <span>{size.label}px</span>
                      {activeFontSize === size.value ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {size.value}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={isColorOpen}
            onOpenChange={(open) => {
              setIsColorOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Text color">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Palette className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-40 p-3">
              <div className="grid grid-cols-5 gap-2">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      applyToSelection(
                        (chain) => {
                          if (!color.value) {
                            return chain.unsetColor();
                          }
                          return chain.setColor(color.value);
                        },
                        { focus: false },
                      );
                    }}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[9px] text-slate-500 transition-transform hover:scale-105 dark:border-slate-700",
                      activeColor === color.value &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: color.value || "transparent" }}
                    title={color.label}
                  >
                    {!color.value ? "A" : ""}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={isHighlightOpen}
            onOpenChange={(open) => {
              setIsHighlightOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Highlight">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Highlighter className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-40 p-3">
              <div className="grid grid-cols-5 gap-2">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      applyToSelection(
                        (chain) => chain.setHighlight({ color: color.value }),
                        { focus: false },
                      );
                    }}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[9px] text-slate-500 transition-transform hover:scale-105 dark:border-slate-700",
                      activeHighlight === color.value &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applyToSelection((chain) => chain.unsetHighlight(), {
                    focus: false,
                  });
                }}
                className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Clear highlight
              </button>
            </PopoverContent>
          </Popover>

          <Popover
            open={isBulletListOpen}
            onOpenChange={(open) => {
              setIsBulletListOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Bulleted list">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                    editor.isActive("bulletList") &&
                      "bg-slate-100 text-primary dark:bg-slate-700",
                  )}
                  aria-label="Bulleted list"
                >
                  <List className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-52 p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Bulleted list
                  </p>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      editor.chain().focus().toggleBulletList().run()
                    }
                    className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                  >
                    {editor.isActive("bulletList") ? "Remove" : "Add"}
                  </button>
                </div>
                <div className="h-px bg-border" />
                {BULLET_LIST_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      applyToSelection(
                        (chain) => chain.setBulletListStyle(style.value),
                        { focus: false },
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {style.value}
                    </span>
                  </button>
                ))}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    applyToSelection(
                      (chain) => chain.setBulletListStyle(null),
                      {
                        focus: false,
                      },
                    )
                  }
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  <span>Default</span>
                  <span className="text-xs text-muted-foreground">unset</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={isOrderedListOpen}
            onOpenChange={(open) => {
              setIsOrderedListOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Numbered list">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                    editor.isActive("orderedList") &&
                      "bg-slate-100 text-primary dark:bg-slate-700",
                  )}
                  aria-label="Numbered list"
                >
                  <ListOrdered className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-52 p-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Numbered list
                  </p>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      editor.chain().focus().toggleOrderedList().run()
                    }
                    className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                  >
                    {editor.isActive("orderedList") ? "Remove" : "Add"}
                  </button>
                </div>
                <div className="h-px bg-border" />
                {ORDERED_LIST_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      applyToSelection(
                        (chain) => chain.setOrderedListStyle(style.value),
                        { focus: false },
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                  >
                    <span>{style.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {style.value}
                    </span>
                  </button>
                ))}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    applyToSelection(
                      (chain) => chain.setOrderedListStyle(null),
                      {
                        focus: false,
                      },
                    )
                  }
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  <span>Default</span>
                  <span className="text-xs text-muted-foreground">unset</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

          <ToolbarTooltip label="Heading 1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleHeading({ level: 1 }));
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("heading", { level: 1 }) &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <Heading1 className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Blockquote">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleBlockquote());
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("blockquote") &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <Quote className="h-5 w-5" />
            </button>
          </ToolbarTooltip>
          <ToolbarTooltip label="Code block">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                storeSelection();
                applyToSelection((chain) => chain.toggleCodeBlock());
              }}
              className={cn(
                "rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700",
                editor.isActive("codeBlock") &&
                  "bg-slate-100 text-primary dark:bg-slate-700",
              )}
            >
              <Code className="h-5 w-5" />
            </button>
          </ToolbarTooltip>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

          <Popover
            open={isAiOpen}
            onOpenChange={(open) => {
              setIsAiOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="AI rewrite">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label="AI rewrite actions"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-56 p-2">
              <div className="space-y-1">
                <p className="px-2 pb-1 text-xs font-semibold text-slate-500">
                  AI rewrite
                </p>
                {[
                  "Make this clearer and concise.",
                  "Shorten this without losing meaning.",
                  "Expand this with a bit more detail.",
                  "Rewrite this in a more professional tone.",
                ].map((instruction) => (
                  <button
                    key={instruction}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runAiRewrite(instruction)}
                    disabled={isRewritingSelection}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-secondary disabled:opacity-60"
                  >
                    <span>{instruction}</span>
                    {isRewritingSelection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={isCommentOpen}
            onOpenChange={(open) => {
              setIsCommentOpen(open);
              if (open) storeSelection();
            }}
          >
            <ToolbarTooltip label="Private note">
              <PopoverTrigger asChild>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  className="rounded p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <StickyNote className="h-5 w-5" />
                </button>
              </PopoverTrigger>
            </ToolbarTooltip>
            <PopoverContent className="z-[10000] w-64 p-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">
                  Private note
                </p>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a note..."
                  className="h-20 w-full resize-none rounded-md border border-slate-200 bg-transparent p-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCommentText("");
                      setIsCommentOpen(false);
                    }}
                    className="rounded-md px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!post?.id) {
                        toast.error("Missing post reference");
                        return;
                      }
                      const text = commentText.trim();
                      if (!text) {
                        toast.error("Note cannot be empty");
                        return;
                      }
                      const selection = selectionRef.current;
                      const selectionText = selection
                        ? editor?.state.doc.textBetween(
                            selection.from,
                            selection.to,
                            " ",
                          )
                        : "";
                      startSavingNote(async () => {
                        try {
                          const note = await createPrivateNote({
                            postId: post.id,
                            content: text,
                            selectionText: selectionText || undefined,
                          });
                          if (selectionRef.current) {
                            editor
                              .chain()
                              .setTextSelection(selectionRef.current)
                              .setMark("privateNote", { noteId: note.id })
                              .run();
                          }
                          onNoteSaved(note);
                          // Persist the mark immediately so refresh doesn't drop the highlight.
                          await savePost(false, true);
                          toast.success("Private note saved");
                          setIsCommentOpen(false);
                          setCommentText("");
                        } catch {
                          toast.error("Failed to save note");
                        }
                      });
                    }}
                    disabled={isSavingNote}
                    className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isSavingNote ? "Saving..." : "Save note"}
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </BubbleMenu>
  );
}



















