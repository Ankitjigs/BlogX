"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Command, Save, Send, Eye, LucideIcon } from "lucide-react";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShortcutsDialog({
  open,
  onOpenChange,
}: ShortcutsDialogProps) {
  const isMac =
    typeof window !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcuts: {
    category: string;
    items: { label: string; keys: string[]; icon?: LucideIcon }[];
  }[] = [
    {
      category: "Essentials",
      items: [
        { label: "Save Draft", keys: [modKey, "S"], icon: Save },
        { label: "Publish", keys: [modKey, "Shift", "P"], icon: Send },
        { label: "Preview", keys: [modKey, "Shift", "V"], icon: Eye },
        { label: "Engaged Mode", keys: [modKey, "Shift", "E"], icon: Keyboard },
      ],
    },
    {
      category: "Formatting",
      items: [
        { label: "Bold", keys: [modKey, "B"] },
        { label: "Italic", keys: [modKey, "I"] },
        { label: "Link", keys: [modKey, "K"] },
        { label: "Code Block", keys: [modKey, "Alt", "C"] },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        closeButtonClassName="rounded-lg p-2 hover:bg-slate-100! dark:hover:bg-slate-800!"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {shortcuts.map((section) => (
            <div key={section.category} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && (
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="flex min-w-[20px] items-center justify-center rounded bg-background px-1.5 py-1 text-[10px] font-bold shadow-sm ring-1 ring-border"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
