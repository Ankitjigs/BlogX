"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface CodeBlockProps {
  children: React.ReactNode;
}

export default function CodeBlock({ children }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // Get the text content from children
    const codeElement = document.createElement("div");
    // We need a way to get the text - we'll use a ref instead
    const preElement = document.querySelector(`[data-copying="true"]`);
    if (!preElement) return;

    const textContent = preElement.textContent || "";

    try {
      await navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      toast.success("Code copied to clipboard");

      // Reset after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }, []);

  return (
    <div className="group relative mb-4 mt-6">
      <pre
        className="overflow-x-auto rounded-lg border bg-muted p-4 pr-12"
        data-code-block
      >
        <code>{children}</code>
      </pre>
      <button
        onClick={async (e) => {
          const pre = e.currentTarget.previousElementSibling;
          if (pre) {
            const textContent = pre.textContent || "";
            try {
              await navigator.clipboard.writeText(textContent);
              setIsCopied(true);
              toast.success("Code copied to clipboard");
              setTimeout(() => setIsCopied(false), 2000);
            } catch {
              toast.error("Failed to copy code");
            }
          }
        }}
        className="absolute right-2 top-2 rounded-md p-2 transition-all duration-200 hover:bg-background/80 bg-background/50"
        aria-label={isCopied ? "Copied" : "Copy code"}
      >
        {isCopied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
