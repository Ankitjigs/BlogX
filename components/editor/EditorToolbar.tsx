"use client";

import { useMemo, type ReactNode } from "react";
import { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  List,
  ListOrdered,
  Highlighter,
  Palette,
  Smile,
  Underline as UnderlineIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  BULLET_LIST_STYLES,
  ORDERED_LIST_STYLES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from "./editor-constants";
import { openEmojiDialog } from "./EmojiPickerDialog";

interface EditorToolbarProps {
  editor: Editor | null;
}

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

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const getActiveTextBlockRange = (editor: Editor) => {
    const { selection } = editor.state;
    if (!selection.empty) return null;
    const $from = selection.$from;
    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === "heading" || node.type.name === "paragraph") {
        return { from: $from.start(depth), to: $from.end(depth) };
      }
    }
    return null;
  };

  const chainWithTextBlockIfEmpty = (editor: Editor) => {
    let chain = editor.chain().focus();
    const range = getActiveTextBlockRange(editor);
    if (range) chain = chain.setTextSelection(range);
    return chain;
  };

  const currentFont =
    editor?.getAttributes("textStyle").fontFamily || "default";
  const currentFontSize =
    editor?.getAttributes("textStyle").fontSize || "default";
  const currentColor = editor?.getAttributes("textStyle").color || "";
  const currentHighlight = editor?.getAttributes("highlight").color || "";

  const currentFontLabel = useMemo(() => {
    const match = FONT_FAMILIES.find((font) => font.value === currentFont);
    return match?.label ?? "Default";
  }, [currentFont]);

  if (!editor) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <Select
        value={currentFont}
        onValueChange={(value) => {
          if (value === "default") {
            chainWithTextBlockIfEmpty(editor).unsetFontFamily().run();
          } else {
            chainWithTextBlockIfEmpty(editor).setFontFamily(value).run();
          }
        }}
      >
        <SelectTrigger size="sm" className="min-w-[130px]">
          <SelectValue placeholder={currentFontLabel} />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.label} value={font.value}>
              <span
                style={{
                  fontFamily: font.value === "default" ? "inherit" : font.value,
                }}
              >
                {font.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentFontSize}
        onValueChange={(value) => {
          if (value === "default") {
            chainWithTextBlockIfEmpty(editor).unsetFontSize().run();
          } else {
            chainWithTextBlockIfEmpty(editor).setFontSize(value).run();
          }
        }}
      >
        <SelectTrigger size="sm" className="min-w-[90px]">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <div className="flex items-center gap-1">
        {(
          [
            { label: "Align left", value: "left", icon: AlignLeft },
            { label: "Align center", value: "center", icon: AlignCenter },
            { label: "Align right", value: "right", icon: AlignRight },
            { label: "Justify", value: "justify", icon: AlignJustify },
          ] as const
        ).map(({ label, value, icon: Icon }) => (
          <ToolbarTooltip key={value} label={label}>
            <button
              onClick={() => editor.chain().focus().setTextAlign(value).run()}
              className={cn(
                "rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                editor.isActive({ textAlign: value }) &&
                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
              )}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          </ToolbarTooltip>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <Popover>
        <ToolbarTooltip label="Bulleted list">
          <PopoverTrigger asChild>
            <button
              className={cn(
                "rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                editor.isActive("bulletList") &&
                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
              )}
              aria-label="Bulleted list"
            >
              <List className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </ToolbarTooltip>
        <PopoverContent className="w-52">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                Bulleted list
              </p>
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-secondary"
              >
                {editor.isActive("bulletList") ? "Remove" : "Add"}
              </button>
            </div>
            <div className="h-px bg-border" />
            {BULLET_LIST_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() =>
                  editor.chain().focus().setBulletListStyle(style.value).run()
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
              onClick={() => editor.chain().focus().setBulletListStyle(null).run()}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
            >
              <span>Default</span>
              <span className="text-xs text-muted-foreground">unset</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <ToolbarTooltip label="Numbered list">
          <PopoverTrigger asChild>
            <button
              className={cn(
                "rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                editor.isActive("orderedList") &&
                  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
              )}
              aria-label="Numbered list"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </PopoverTrigger>
        </ToolbarTooltip>
        <PopoverContent className="w-52">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                Numbered list
              </p>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-secondary"
              >
                {editor.isActive("orderedList") ? "Remove" : "Add"}
              </button>
            </div>
            <div className="h-px bg-border" />
            {ORDERED_LIST_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() =>
                  editor.chain().focus().setOrderedListStyle(style.value).run()
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
              onClick={() => editor.chain().focus().setOrderedListStyle(null).run()}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
            >
              <span>Default</span>
              <span className="text-xs text-muted-foreground">unset</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <ToolbarTooltip label="Underline">
        <button
          onClick={() => chainWithTextBlockIfEmpty(editor).toggleUnderline().run()}
          className={cn(
            "rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
            editor.isActive("underline") &&
              "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white",
          )}
          aria-label="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </ToolbarTooltip>

      <Popover>
        <ToolbarTooltip label="Text color">
          <PopoverTrigger asChild>
            <button
              className="relative rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Text color"
            >
              <Palette className="h-4 w-4" />
              <span
                className="absolute bottom-1 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: currentColor || "#94a3b8" }}
              />
            </button>
          </PopoverTrigger>
        </ToolbarTooltip>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-5 gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.label}
                onClick={() => {
                  if (!color.value) {
                    chainWithTextBlockIfEmpty(editor).unsetColor().run();
                  } else {
                    chainWithTextBlockIfEmpty(editor).setColor(color.value).run();
                  }
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-500 transition-transform hover:scale-105 dark:border-slate-700",
                  currentColor === color.value &&
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

      <Popover>
        <ToolbarTooltip label="Highlight color">
          <PopoverTrigger asChild>
            <button
              className="relative rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Highlight color"
            >
              <Highlighter className="h-4 w-4" />
              <span
                className="absolute bottom-1 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: currentHighlight || "#fde68a" }}
              />
            </button>
          </PopoverTrigger>
        </ToolbarTooltip>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-5 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.label}
                onClick={() => {
                  chainWithTextBlockIfEmpty(editor)
                    .setHighlight({ color: color.value })
                    .run();
                }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-500 transition-transform hover:scale-105 dark:border-slate-700",
                  currentHighlight === color.value &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
            <button
              onClick={() => chainWithTextBlockIfEmpty(editor).unsetHighlight().run()}
              className="col-span-5 mt-2 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Clear highlight
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />

      <ToolbarTooltip label="Insert emoji">
        <button
          onClick={() =>
            openEmojiDialog((emoji) =>
              editor.chain().focus().insertContent(emoji).run(),
            )
          }
          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Insert emoji"
        >
          <Smile className="h-4 w-4" />
        </button>
      </ToolbarTooltip>
    </div>
  );
}
