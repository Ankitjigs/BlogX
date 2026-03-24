"use client";

import { useEffect } from "react";
import { useEditorContext } from "./EditorContext";
import { toast } from "sonner";

export default function ShortcutsHandler() {
  const { savePost, updateState, state } = useEditorContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Save: Cmd + S
      if (isMod && e.key === "s") {
        e.preventDefault();
        savePost(false);
      }

      // Publish: Cmd + Shift + P
      if (isMod && e.shiftKey && e.key === "p") {
        e.preventDefault();
        // Toggle publish status intent or direct publish
        savePost(true);
      }

      // Preview: Cmd + Shift + V (View)
      if (isMod && e.shiftKey && e.key === "v") {
        e.preventDefault();
        const url = `/api/preview/${state.slug}`; // Or use context post id if available
        window.open(url, "_blank");
      }

      // Engaged Mode: Cmd + Shift + E
      if (isMod && e.shiftKey && e.key === "e") {
        e.preventDefault();
        updateState({ isEngagedMode: !state.isEngagedMode });
        toast.info(
          !state.isEngagedMode ? "Engaged Mode On" : "Engaged Mode Off",
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [savePost, updateState, state.isEngagedMode, state.slug]);

  return null;
}
