"use client";

import { Extension } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    listStyle: {
      setBulletListStyle: (style: string | null) => ReturnType;
      setOrderedListStyle: (style: string | null) => ReturnType;
    };
  }
}

export const ListStyle = Extension.create({
  name: "listStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["bulletList", "orderedList"],
        attributes: {
          listStyleType: {
            default: null,
            parseHTML: (element) => element.style.listStyleType || null,
            renderHTML: (attributes) => {
              if (!attributes.listStyleType) return {};
              return {
                style: `list-style-type: ${attributes.listStyleType}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setBulletListStyle:
        (style) =>
        ({ editor, chain }) => {
          if (!editor.isActive("bulletList")) {
            chain().toggleBulletList().run();
          }
          return chain()
            .updateAttributes("bulletList", {
              listStyleType: style,
            })
            .run();
        },
      setOrderedListStyle:
        (style) =>
        ({ editor, chain }) => {
          if (!editor.isActive("orderedList")) {
            chain().toggleOrderedList().run();
          }
          return chain()
            .updateAttributes("orderedList", {
              listStyleType: style,
            })
            .run();
        },
    };
  },
});

