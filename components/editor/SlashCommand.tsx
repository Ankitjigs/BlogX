"use client";

import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Extension } from "@tiptap/core";
import Suggestion, {
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { ReactRenderer, Editor, Range } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  Text,
  Quote,
  Code,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { openEmojiDialog } from "./EmojiPickerDialog";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  searchTerms?: string[];
  command: (props: { editor: Editor; range: Range }) => void;
}

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  editor: Editor;
  range: Range;
}

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

// Command List Component
export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { items, command } = props;

    // Reset selection when items change during render
    const [prevItems, setPrevItems] = useState(items);
    if (items !== prevItems) {
      setPrevItems(items);
      setSelectedIndex(0);
    }

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [command, items],
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="z-9999 h-auto max-h-82.5 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white slash-menu-shadow dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
          Basic Blocks
        </div>
        <div className="p-1">
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                className={`group flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors ${
                  isSelected
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
                key={index}
                onClick={() => selectItem(index)}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="text-left">
                  <div
                    className={`text-sm font-semibold ${
                      isSelected
                        ? "text-white"
                        : "text-slate-900 dark:text-gray-100 group-hover:text-white"
                    }`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`text-[10px] ${
                      isSelected
                        ? "text-white/70"
                        : "text-slate-500 group-hover:text-white/70"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

CommandList.displayName = "CommandList";

// Suggestion Config
const getSuggestionItems = ({ query }: { query: string }): CommandItem[] => {
  return [
    {
      title: "Text",
      description: "Plain text block",
      searchTerms: ["p", "paragraph"],
      icon: <Text className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .run();
      },
    },
    {
      title: "Heading 1",
      description: "Big section heading",
      searchTerms: ["title", "big", "large"],
      icon: <Heading1 className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["subtitle", "medium"],
      icon: <Heading2 className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["small"],
      icon: <Heading3 className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "Quote",
      description: "Capture a quote",
      searchTerms: ["blockquote"],
      icon: <Quote className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .toggleBlockquote()
          .run();
      },
    },
    {
      title: "Code Block",
      description: "Syntax highlighted snippets",
      searchTerms: ["codeblock", "css", "js"],
      icon: <Code className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Image",
      description: "Upload or Embed",
      searchTerms: ["image", "picture"],
      icon: <ImageIcon className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        // Import dynamically and use the dialog
        import("./ImageUrlDialog").then(({ openImageDialog }) => {
          openImageDialog((url) => {
            if (url) {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setImage({ src: url })
                .run();
            }
          });
        });
      },
    },
    {
      title: "Emoji",
      description: "Insert an emoji",
      searchTerms: ["emoji", "smile", "icon"],
      icon: <Smile className="h-4 w-4" />,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        openEmojiDialog((emoji) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent(emoji)
            .run();
        });
      },
    },
  ].filter((item) => {
    if (typeof query === "string" && query.length > 0) {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        (item.searchTerms &&
          item.searchTerms.some((term: string) => term.includes(search)))
      );
    }
    return true;
  });
};

const renderItems = () => {
  let component: ReactRenderer<CommandListRef, CommandListProps> | null = null;
  let popup: Instance[] | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      component = new ReactRenderer(CommandList, {
        props: props as CommandListProps,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      const clientRect = props.clientRect as () => DOMRect;

      popup = tippy("body", {
        getReferenceClientRect: clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
        zIndex: 9999,
      });
    },
    onUpdate: (props: SuggestionProps) => {
      component?.updateProps(props as CommandListProps);

      if (!props.clientRect) {
        return;
      }

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect as () => DOMRect,
      });
    },
    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();
        return true;
      }
      return component?.ref?.onKeyDown(props) ?? false;
    },
    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: CommandItem;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const suggestionOptions = {
  items: getSuggestionItems,
  render: renderItems,
};

export default SlashCommand;
