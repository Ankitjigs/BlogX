"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, LinkIcon, UploadCloud, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/supabase";
import { toast } from "sonner";

interface ImageUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function ImageUrlDialog({
  open,
  onClose,
  onSubmit,
}: ImageUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setUrl(""); // Reset URL when dialog closes
        onClose();
      }
    },
    [onClose],
  );

  const handleSubmit = useCallback(() => {
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl("");
      onClose();
    }
  }, [url, onSubmit, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      const uploadedUrl = await uploadImage(file);
      if (uploadedUrl) {
        setUrl(uploadedUrl);
        toast.success("Image uploaded!");
      } else {
        toast.error("Failed to upload image");
      }
      setIsUploading(false);
      e.target.value = "";
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        closeButtonClassName="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              Insert Image
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Enter the URL of the image you want to embed in your story.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div className="space-y-2.5">
            <label
              htmlFor="image-url"
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <LinkIcon className="h-4 w-4" />
              Image URL
            </label>
            <input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>

          {url && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Preview
              </p>
              <div className="flex items-center justify-center rounded-lg bg-white p-2 dark:bg-slate-900">
                <img
                  src={url}
                  alt="Preview"
                  className="max-h-48 w-full rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = "block";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 gap-3 sm:gap-2">
          <Button variant="ghost" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!url.trim()}
            className="px-6"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Global event system for triggering the dialog
type ImageDialogCallback = (url: string) => void;

let globalCallback: ImageDialogCallback | null = null;
let globalSetOpen: ((open: boolean) => void) | null = null;

export function openImageDialog(callback: ImageDialogCallback) {
  globalCallback = callback;
  globalSetOpen?.(true);
}

export function ImageUrlDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    globalSetOpen = setOpen;
    return () => {
      globalSetOpen = null;
    };
  }, []);

  const handleSubmit = useCallback((url: string) => {
    globalCallback?.(url);
    globalCallback = null;
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    globalCallback = null;
  }, []);

  return (
    <>
      {children}
      <ImageUrlDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
