"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Editor } from "@tiptap/react";
import tippy, { Instance } from "tippy.js";
import { toast } from "sonner";
import { deletePrivateNote, updatePrivateNote } from "@/actions/private-notes";

type PrivateNoteMap = Record<string, { id: string; content: string }>;

function removeNoteMark(editor: Editor, noteId: string) {
  const markType = editor.schema.marks.privateNote;
  if (!markType) return;

  const { state, view } = editor;
  const tr = state.tr;
  let didChange = false;

  state.doc.descendants((node, pos) => {
    if (!node.isText) return;
    const hasNote = node.marks.some(
      (m) => m.type === markType && m.attrs?.noteId === noteId,
    );
    if (!hasNote) return;
    tr.removeMark(pos, pos + node.nodeSize, markType);
    didChange = true;
  });

  if (didChange) {
    view.dispatch(tr);
  }
}

export default function PrivateNotesHoverTooltip({
  editor,
  notes,
  onNoteDeleted,
  onNoteUpdated,
}: {
  editor: Editor | null;
  notes: PrivateNoteMap;
  onNoteDeleted: (noteId: string) => void;
  onNoteUpdated: (note: { id: string; content: string }) => void;
}) {
  const tippyInstanceRef = useRef<Instance | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const escapeHandlerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

  const notesById = useMemo(() => notes, [notes]);

  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom as HTMLElement;

    const destroyTooltip = () => {
      if (escapeHandlerRef.current) {
        window.removeEventListener("keydown", escapeHandlerRef.current);
        escapeHandlerRef.current = null;
      }
      const inst = tippyInstanceRef.current;
      tippyInstanceRef.current = null;
      hoveredIdRef.current = null;
      inst?.destroy();
    };

    const showForEl = (el: HTMLElement, noteId: string) => {
      if (hoveredIdRef.current === noteId && tippyInstanceRef.current) return;
      destroyTooltip();

      const note = notesById[noteId];
      if (!note) return;

      const contentEl = document.createElement("div");
      contentEl.className = "private-note-tooltip";
      contentEl.setAttribute("role", "dialog");
      contentEl.setAttribute("aria-label", "Private note tooltip");
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark");
      if (isDark) contentEl.classList.add("is-dark");

      const headerEl = document.createElement("div");
      headerEl.className = "private-note-tooltip__header";
      headerEl.textContent = "\uD83D\uDD12 Private note";

      const helperEl = document.createElement("div");
      helperEl.className = "private-note-tooltip__helper";
      helperEl.textContent = "This note is visible only to you.";

      const noteBoxEl = document.createElement("div");
      noteBoxEl.className = "private-note-tooltip__note";

      const textEl = document.createElement("div");
      textEl.className = "private-note-tooltip__text";
      textEl.textContent = note.content;

      const actionsEl = document.createElement("div");
      actionsEl.className = "private-note-tooltip__actions";

      const editBtn = document.createElement("button");
      editBtn.className = "private-note-tooltip__edit";
      editBtn.textContent = "Edit";

      const removeBtn = document.createElement("button");
      removeBtn.className = "private-note-tooltip__remove";
      removeBtn.textContent = "Remove";

      const editorEl = document.createElement("div");
      editorEl.className = "private-note-tooltip__editor";
      editorEl.style.display = "none";

      const textareaEl = document.createElement("textarea");
      textareaEl.className = "private-note-tooltip__textarea";
      textareaEl.value = note.content;

      const editorActionsEl = document.createElement("div");
      editorActionsEl.className = "private-note-tooltip__editorActions";

      const cancelEditBtn = document.createElement("button");
      cancelEditBtn.className = "private-note-tooltip__ghost";
      cancelEditBtn.textContent = "Cancel";

      const saveEditBtn = document.createElement("button");
      saveEditBtn.className = "private-note-tooltip__primary";
      saveEditBtn.textContent = "Save";

      editorActionsEl.appendChild(cancelEditBtn);
      editorActionsEl.appendChild(saveEditBtn);
      editorEl.appendChild(textareaEl);
      editorEl.appendChild(editorActionsEl);

      const confirmEl = document.createElement("div");
      confirmEl.className = "private-note-tooltip__confirm";
      confirmEl.style.display = "none";

      const confirmTextEl = document.createElement("div");
      confirmTextEl.className = "private-note-tooltip__confirmText";
      confirmTextEl.textContent = "Remove this private note?";

      const confirmActionsEl = document.createElement("div");
      confirmActionsEl.className = "private-note-tooltip__confirmActions";

      const cancelRemoveBtn = document.createElement("button");
      cancelRemoveBtn.className = "private-note-tooltip__ghost";
      cancelRemoveBtn.textContent = "Cancel";

      const confirmRemoveBtn = document.createElement("button");
      confirmRemoveBtn.className = "private-note-tooltip__danger";
      confirmRemoveBtn.textContent = "Remove";

      confirmActionsEl.appendChild(cancelRemoveBtn);
      confirmActionsEl.appendChild(confirmRemoveBtn);
      confirmEl.appendChild(confirmTextEl);
      confirmEl.appendChild(confirmActionsEl);

      const setEditing = (editing: boolean) => {
        editorEl.style.display = editing ? "block" : "none";
        actionsEl.style.display = editing ? "none" : "flex";
        confirmEl.style.display = "none";
        noteBoxEl.style.display = editing ? "none" : "block";
        if (editing) {
          textareaEl.value = textEl.textContent || "";
          window.setTimeout(() => textareaEl.focus(), 0);
        }
      };

      const setConfirmingRemove = (confirming: boolean) => {
        confirmEl.style.display = confirming ? "block" : "none";
        actionsEl.style.display = confirming ? "none" : "flex";
        editorEl.style.display = "none";
      };

      editBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditing(true);
      };

      cancelEditBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditing(false);
      };

      saveEditBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = textareaEl.value.trim();
        if (!next) {
          toast.error("Note cannot be empty");
          return;
        }
        try {
          const updated = await updatePrivateNote({ noteId, content: next });
          textEl.textContent = updated.content;
          onNoteUpdated(updated);
          toast.success("Note updated");
          setEditing(false);
        } catch {
          toast.error("Failed to update note");
        }
      };

      removeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmingRemove(true);
      };

      cancelRemoveBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmingRemove(false);
      };

      confirmRemoveBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await deletePrivateNote(noteId);
          removeNoteMark(editor, noteId);
          onNoteDeleted(noteId);
          toast.success("Note removed");
          destroyTooltip();
        } catch {
          toast.error("Failed to remove note");
        }
      };

      // Only confirm flow handles deletion.

      noteBoxEl.appendChild(textEl);

      actionsEl.appendChild(editBtn);
      actionsEl.appendChild(removeBtn);
      contentEl.appendChild(headerEl);
      contentEl.appendChild(helperEl);
      contentEl.appendChild(noteBoxEl);
      contentEl.appendChild(editorEl);
      contentEl.appendChild(confirmEl);
      contentEl.appendChild(actionsEl);

      const instance = tippy(el, {
        content: contentEl,
        allowHTML: true,
        interactive: true,
        hideOnClick: false,
        trigger: "manual",
        placement: "top",
        arrow: false,
        appendTo: () => document.body,
        zIndex: 10050,
        onCreate: (inst) => {
          inst.popper.classList.add("private-note-tippy");
        },
        onShow: () => {
          setEditing(false);
          setConfirmingRemove(false);
        },
        onClickOutside: () => destroyTooltip(),
        onHidden: () => {
          destroyTooltip();
        },
      });

      instance.show();
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          destroyTooltip();
        }
      };
      escapeHandlerRef.current = handleEscape;
      window.addEventListener("keydown", handleEscape);
      tippyInstanceRef.current = instance;
      hoveredIdRef.current = noteId;
    };

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        "span[data-private-note-id]",
      ) as HTMLElement | null;
      if (!el) return;
      const noteId = el.getAttribute("data-private-note-id");
      if (!noteId) return;
      showForEl(el, noteId);
    };

    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        "span[data-private-note-id]",
      ) as HTMLElement | null;
      if (!el) return;

      const related = event.relatedTarget as Node | null;
      const popper = tippyInstanceRef.current?.popper as HTMLElement | undefined;
      if (related && popper && popper.contains(related)) return;

      window.setTimeout(() => {
        // If mouse moved into tooltip, keep it open.
        const p = tippyInstanceRef.current?.popper as HTMLElement | undefined;
        if (p && p.matches(":hover")) return;
        destroyTooltip();
      }, 160);
    };

    root.addEventListener("mouseover", handleMouseOver);
    root.addEventListener("mouseout", handleMouseOut);

    return () => {
      root.removeEventListener("mouseover", handleMouseOver);
      root.removeEventListener("mouseout", handleMouseOut);
      destroyTooltip();
    };
  }, [editor, notesById, onNoteDeleted, onNoteUpdated]);

  return null;
}
