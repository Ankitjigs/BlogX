"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Editor, type JSONContent } from "@tiptap/react";
import type { Post } from "@prisma/client";
import { updatePost } from "@/actions/post";
import { generatePublishChecks } from "@/actions/ai";
import { toast } from "sonner";

interface EditorState {
  title: string;
  titleContent?: JSONContent | null;
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  tags: string[];
  featuredImage: string | null;
  categoryId: string | null; // New: Category support
  publishStatus: "draft" | "published";
  isSaving: boolean;
  isEngagedMode: boolean; // New: UI state
  isShortcutsOpen: boolean;
  lastSaved: Date | null;
  wordCount: number;
}

interface EditorContextType {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  post: (Post & { tags?: { name: string }[] }) | null; // Update type hint to include tags
  state: EditorState;
  updateState: (updates: Partial<EditorState>) => void;
  savePost: (isPublishing?: boolean, silent?: boolean) => Promise<void>;
  markDirty: () => void;
  isDirty: boolean;
  toggleShortcuts: (open?: boolean) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  initialPost,
}: {
  children: ReactNode;
  initialPost?: Post & {
    tags?: { name: string }[];
    category?: { id: string } | null;
  };
}) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [state, setState] = useState<EditorState>({
    title: initialPost?.title || "",
    titleContent: (initialPost?.titleContent as JSONContent) ?? null,
    slug: initialPost?.slug || "",
    excerpt: initialPost?.excerpt || "",
    metaTitle: initialPost?.metaTitle || "",
    metaDescription: initialPost?.metaDescription || "",
    canonicalUrl: initialPost?.canonicalUrl || "",
    tags: initialPost?.tags?.map((t) => t.name) || [], // Map relation to string array
    categoryId: initialPost?.categoryId || null,
    featuredImage: initialPost?.coverImage || null,
    publishStatus: initialPost?.published ? "published" : "draft",
    isSaving: false,
    isEngagedMode: false,
    isShortcutsOpen: false, // New: UI state
    lastSaved: initialPost?.updatedAt || null,
    wordCount: 0,
  });

  // ========== LAYER 1: Data (Refs for stable callbacks) ==========
  const stateRef = useRef(state);
  const editorRef = useRef<Editor | null>(editor);

  // Update refs in effects (not during render)
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // ========== LAYER 2: Intent (Dirty flag) ==========
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleShortcuts = useCallback((open?: boolean) => {
    setState((prev) => ({
      ...prev,
      isShortcutsOpen: open !== undefined ? open : !prev.isShortcutsOpen,
    }));
  }, []);

  // ========== Save function with stable reference ==========
  const savePost = useCallback(
    async (isPublishing: boolean = false, silent: boolean = false) => {
      const currentEditor = editorRef.current;
      const currentState = stateRef.current;

      if (!initialPost || !currentEditor) {
        console.warn("Cannot save: missing post or editor", {
          initialPost,
          currentEditor,
        });
        return;
      }

      // Optimistic update for UI feedback
      updateState({ isSaving: true });

      try {
        // Get editor content and ensure it's serializable
        const rawContent = currentEditor.getJSON();
        const content = JSON.parse(JSON.stringify(rawContent));
        const titleContent = currentState.titleContent
          ? JSON.parse(JSON.stringify(currentState.titleContent))
          : undefined;

        // Prepare data with explicit null handling for server action
        const updateData = {
          title: currentState.title || "",
          titleContent,
          slug: currentState.slug || "",
          excerpt: currentState.excerpt || "",
          metaTitle: currentState.metaTitle || undefined,
          metaDescription: currentState.metaDescription || undefined,
          canonicalUrl: currentState.canonicalUrl || undefined,
          coverImage: currentState.featuredImage || undefined,
          categoryId: currentState.categoryId || undefined, // Send category ID
          tags: currentState.tags, // Pass tags array
          content: content,
          published: isPublishing
            ? true
            : currentState.publishStatus === "published",
        };

        await updatePost(initialPost.id, updateData);

        if (isPublishing) {
          try {
            const checks = await generatePublishChecks(initialPost.id);
            const highSeverityCount = checks.issues.filter(
              (issue) => issue.severity === "high",
            ).length;
            if (highSeverityCount > 0) {
              toast.warning(
                `Published with ${highSeverityCount} high-severity check${highSeverityCount > 1 ? "s" : ""}. Review AI checks in sidebar.`,
              );
            }
          } catch {
            // Non-blocking: publish should not fail if checks fail
          }
        }

        updateState({
          isSaving: false,
          lastSaved: new Date(),
          publishStatus: isPublishing
            ? "published"
            : currentState.publishStatus,
        });

        if (!silent) {
          const successMessage = isPublishing
            ? "Post published successfully!"
            : "Draft saved successfully.";
          toast.success(successMessage);
        }
      } catch (error) {
        console.error("Failed to save post", error);
        if (!silent) {
          toast.error("Failed to save post. Please try again.");
        }
        updateState({ isSaving: false });
      }
    },
    [initialPost, updateState],
  );

  // ========== LAYER 3: Trigger (Debounced auto-save) ==========
  useEffect(() => {
    // Only save if dirty and we have a post
    if (!isDirty || !initialPost) return;

    const timer = setTimeout(() => {
      savePost(false, true);
      setIsDirty(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDirty, initialPost, savePost]);

  return (
    <EditorContext.Provider
      value={{
        editor,
        setEditor,
        post: initialPost || null,
        state,
        updateState,
        savePost,
        markDirty,
        isDirty, // Expose dirtiness
        toggleShortcuts,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}
