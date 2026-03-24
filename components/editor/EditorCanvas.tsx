"use client";

import { useEditorContext } from "./EditorContext";
import {
  useEditor,
  EditorContent,
  JSONContent,
  type Editor as TiptapEditor,
} from "@tiptap/react";
import { useEffect, useState } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CharacterCount from "@tiptap/extension-character-count";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import { EditorView } from "@tiptap/pm/view";
import SlashCommand, { suggestionOptions } from "./SlashCommand";
import EditorBubbleMenu from "./EditorBubbleMenu";
import EditorToolbar from "./EditorToolbar";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";
import { FontSize } from "./extensions/font-size";
import { ListStyle } from "./extensions/list-style";
import { PrivateNoteMark } from "./extensions/private-note";
import PrivateNotesHoverTooltip from "./PrivateNotesHoverTooltip";
import { listPrivateNotes } from "@/actions/private-notes";

export default function EditorCanvas() {
  const { setEditor, state, updateState, post, markDirty } = useEditorContext();
  const [activeEditor, setActiveEditor] = useState<TiptapEditor | null>(null);
  const [privateNotes, setPrivateNotes] = useState<
    Record<string, { id: string; content: string }>
  >({});

  const uploadAndInsertImage = async (
    file: File,
    editorInstance: TiptapEditor,
    position?: number,
  ) => {
    toast.info("Uploading image...");
    const url = await uploadImage(file);
    if (url) {
      if (typeof position === "number") {
        editorInstance
          .chain()
          .focus()
          .setTextSelection(position)
          .setImage({ src: url })
          .run();
      } else {
        editorInstance.chain().focus().setImage({ src: url }).run();
      }
      toast.success("Image uploaded!");
    } else {
      toast.error("Failed to upload image");
    }
  };

  const titleEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1] },
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: "Post Title",
        emptyEditorClass: "is-editor-empty",
      }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      PrivateNoteMark,
    ],
    content:
      state.titleContent ??
      (state.title
        ? {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: state.title }],
              },
            ],
          }
        : {
            type: "doc",
            content: [{ type: "heading", attrs: { level: 1 }, content: [] }],
          }),
    editorProps: {
      attributes: {
        class:
          "title-editor focus:outline-none max-w-none text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-100",
      },
      handleKeyDown: (_view, event) => {
        if (event.key === "Enter") return true;
        return false;
      },
    },
    autofocus: !state.title,
    onUpdate: ({ editor }) => {
      const text = editor.getText().replace(/\n/g, "");
      updateState({ title: text, titleContent: editor.getJSON() });
      markDirty();
    },
    onFocus: ({ editor }) => {
      setActiveEditor(editor);
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your story...",
        emptyEditorClass: "is-editor-empty",
      }),
      Typography,
      TextStyle,
      FontSize,
      PrivateNoteMark,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      FontFamily,
      ListStyle,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      SlashCommand.configure({
        suggestion: suggestionOptions,
      }),
      CharacterCount,
      BubbleMenu,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: post?.content as JSONContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert focus:outline-none max-w-none text-xl leading-relaxed text-slate-700 dark:text-slate-300 writing-area min-h-[500px]",
      },
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        if (!editor || !event.clipboardData) return false;
        const files = Array.from(event.clipboardData.files || []);
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/"),
        );
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        imageFiles.forEach((file) => {
          void uploadAndInsertImage(file, editor);
        });
        return true;
      },
      handleDrop: (view: EditorView, event: DragEvent, _slice, _moved) => {
        if (!editor || !event.dataTransfer) return false;
        const files = Array.from(event.dataTransfer.files || []);
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/"),
        );
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        const position = coords?.pos;
        imageFiles.forEach((file) => {
          void uploadAndInsertImage(file, editor, position);
        });
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const count = editor.storage.characterCount.words();
      updateState({ wordCount: count });
      markDirty(); // Mark as dirty when content changes
    },
    onCreate: ({ editor }) => {
      setEditor(editor);
      // Initialize word count on load
      const count = editor.storage.characterCount.words();
      updateState({ wordCount: count });
    },
    onFocus: ({ editor }) => {
      setActiveEditor(editor);
    },
  });

  // Dynamic Typography for Engaged Mode
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: `prose prose-lg dark:prose-invert focus:outline-none max-w-none transition-all duration-300 ${
              state.isEngagedMode
                ? "text-[22px] leading-10 prose-p:my-8 text-slate-800 dark:text-slate-200"
                : "text-xl leading-relaxed text-slate-700 dark:text-slate-300"
            } writing-area min-h-[500px]`,
          },
        },
      });
    }
  }, [editor, state.isEngagedMode]);

  // Load private notes for this post
  useEffect(() => {
    if (!post?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const notes = await listPrivateNotes(post.id);
        if (cancelled) return;
        setPrivateNotes(
          Object.fromEntries(
            notes.map((n) => [n.id, { id: n.id, content: n.content }]),
          ),
        );
      } catch {
        // Non-blocking
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post?.id]);

  return (
    <div className="relative pb-40">
      <EditorBubbleMenu
        editor={activeEditor ?? editor}
        onNoteSaved={(note) =>
          setPrivateNotes((prev) => ({ ...prev, [note.id]: note }))
        }
      />
      <PrivateNotesHoverTooltip
        editor={editor}
        notes={privateNotes}
        onNoteDeleted={(noteId) =>
          setPrivateNotes((prev) => {
            const next = { ...prev };
            delete next[noteId];
            return next;
          })
        }
        onNoteUpdated={(note) =>
          setPrivateNotes((prev) => ({ ...prev, [note.id]: note }))
        }
      />

      {!state.isEngagedMode && (
        <EditorToolbar editor={activeEditor ?? editor} />
      )}

      <div
        className={`${state.isEngagedMode ? "mb-24" : "mb-12"} transition-all duration-300`}
      >
        <EditorContent editor={titleEditor} />
      </div>

      <EditorContent editor={editor} />

      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .title-editor .is-editor-empty:first-child::before {
          color: #cbd5f5;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .dark .title-editor .is-editor-empty:first-child::before {
          color: #334155;
        }
        .title-editor h1,
        .title-editor p {
          margin: 0;
        }
        .emoji-dialog-open .editor-bubble-menu {
          display: none !important;
        }
        .writing-area {
          min-height: 60vh;
        }
        .private-note {
          background: rgba(250, 204, 21, 0.35);
          border-radius: 4px;
          padding: 0 2px;
          cursor: pointer;
        }
        .dark .private-note {
          background: rgba(250, 204, 21, 0.25);
        }
        .private-note-tooltip {
          max-width: 320px;
          padding: 10px 12px;
          background: #ffffff;
          color: #111827;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          text-align: left;
        }
        .private-note-tooltip.is-dark {
          background: #0b1220;
          color: #e5e7eb;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
        .private-note-tooltip__header {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: inherit;
        }
        .private-note-tooltip__helper {
          margin-top: 4px;
          font-size: 11px;
          line-height: 1.4;
          color: #6b7280;
        }
        .private-note-tooltip.is-dark .private-note-tooltip__helper {
          color: #9ca3af;
        }
        .private-note-tooltip__note {
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(15, 23, 42, 0.04);
        }
        .private-note-tooltip.is-dark .private-note-tooltip__note {
          background: rgba(255, 255, 255, 0.04);
        }
        .private-note-tooltip__text {
          font-size: 12px;
          line-height: 1.4;
          white-space: pre-wrap;
          color: inherit;
        }
        .private-note-tooltip__actions {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .private-note-tooltip__edit {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: inherit;
          background: transparent;
          border: 1px solid rgba(15, 23, 42, 0.12);
        }
        .private-note-tooltip.is-dark .private-note-tooltip__edit {
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .private-note-tooltip__edit:hover {
          background: rgba(15, 23, 42, 0.04);
        }
        .private-note-tooltip.is-dark .private-note-tooltip__edit:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .private-note-tooltip__remove {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          background: transparent;
          border: 1px solid transparent;
        }
        .private-note-tooltip__remove:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.22);
        }
        .private-note-tooltip__editor {
          margin-top: 10px;
        }
        .private-note-tooltip__textarea {
          width: 100%;
          min-height: 84px;
          resize: none;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          line-height: 1.4;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: inherit;
          outline: none;
        }
        .private-note-tooltip.is-dark .private-note-tooltip__textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .private-note-tooltip__editorActions {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .private-note-tooltip__ghost {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          background: transparent;
        }
        .private-note-tooltip__ghost:hover {
          color: inherit;
          background: rgba(15, 23, 42, 0.04);
        }
        .private-note-tooltip.is-dark .private-note-tooltip__ghost:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .private-note-tooltip__primary {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #0b1220;
          background: #e5e7eb;
        }
        .private-note-tooltip__primary:hover {
          opacity: 0.92;
        }
        .private-note-tooltip__confirm {
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.18);
        }
        .private-note-tooltip__confirmText {
          font-size: 12px;
          line-height: 1.4;
          color: inherit;
        }
        .private-note-tooltip__confirmActions {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .private-note-tooltip__danger {
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #ef4444;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.22);
        }
        .private-note-tooltip__danger:hover {
          background: rgba(239, 68, 68, 0.12);
        }
        .tippy-box.private-note-tippy {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .tippy-box.private-note-tippy .private-note-tooltip {
          transform: translateY(2px) scale(0.98);
          opacity: 0;
          transition:
            transform 120ms ease,
            opacity 120ms ease;
        }
        .tippy-box.private-note-tippy[data-state="visible"] .private-note-tooltip {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .tippy-content {
          padding: 0;
        }
      `}</style>
    </div>
  );
}
