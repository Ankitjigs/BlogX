"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from "react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from "emoji-picker-react";
import { useTheme } from "next-themes";

interface EmojiPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export function EmojiPickerPanel({
  onSelect,
  height = 360,
}: {
  onSelect: (emoji: string) => void;
  height?: number;
}) {
  const { theme } = useTheme();

  const handleSelect = useCallback(
    (emojiData: EmojiClickData) => {
      onSelect(emojiData.emoji);
    },
    [onSelect],
  );

  return (
    <EmojiPicker
      onEmojiClick={handleSelect}
      emojiStyle={EmojiStyle.GOOGLE}
      theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
      lazyLoadEmojis
      previewConfig={{ showPreview: false }}
      searchPlaceHolder="Search emoji..."
      width="100%"
      height={height}
      className="custom-scrollbar"
    />
  );
}

function EmojiPickerDialog({
  open,
  onClose,
  onSelect,
}: EmojiPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Emoji</DialogTitle>
          <DialogDescription>
            Search and insert an emoji into your post.
          </DialogDescription>
        </DialogHeader>
        <EmojiPickerPanel
          onSelect={(emoji) => {
            onSelect(emoji);
            onClose();
          }}
          height={360}
        />
      </DialogContent>
    </Dialog>
  );
}

type EmojiDialogCallback = (emoji: string) => void;

let globalCallback: EmojiDialogCallback | null = null;
let globalSetOpen: ((open: boolean) => void) | null = null;

export function openEmojiDialog(callback: EmojiDialogCallback) {
  globalCallback = callback;
  globalSetOpen?.(true);
}

const EmojiDialogContext = createContext(false);

export function useEmojiDialogOpen() {
  return useContext(EmojiDialogContext);
}

export function EmojiPickerDialogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    globalSetOpen = setOpen;
    return () => {
      globalSetOpen = null;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("emoji-dialog-open", open);
    return () => {
      document.body.classList.remove("emoji-dialog-open");
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
    globalCallback = null;
  }, []);

  const handleSelect = useCallback((emoji: string) => {
    globalCallback?.(emoji);
    globalCallback = null;
  }, []);

  return (
    <EmojiDialogContext.Provider value={open}>
      {children}
      <EmojiPickerDialog
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </EmojiDialogContext.Provider>
  );
}
