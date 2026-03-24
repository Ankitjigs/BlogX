"use client";

import type { Post } from "@prisma/client";
import { EditorProvider } from "./EditorContext";
import EditorLayout from "./EditorLayout";
import EditorCanvas from "./EditorCanvas";

interface EditorScreenProps {
  initialPost: Post & {
    tags?: { name: string }[];
    category?: { id: string } | null;
  };
}

export default function EditorScreen({ initialPost }: EditorScreenProps) {
  return (
    <EditorProvider initialPost={initialPost}>
      <EditorLayout>
        <EditorCanvas />
      </EditorLayout>
    </EditorProvider>
  );
}
