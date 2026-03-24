"use client";

import { Mark } from "@tiptap/core";

export const PrivateNoteMark = Mark.create({
  name: "privateNote",
  inclusive: false,

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-private-note-id"),
        renderHTML: (attributes) => {
          if (!attributes.noteId) return {};
          return { "data-private-note-id": attributes.noteId };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-private-note-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", { ...HTMLAttributes, class: "private-note" }, 0];
  },
});

