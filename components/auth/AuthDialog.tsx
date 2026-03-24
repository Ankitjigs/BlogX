"use client";

import { SignInButton } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel?: string;
}

export default function AuthDialog({
  open,
  onOpenChange,
  triggerLabel = "sign in",
}: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        closeButtonClassName="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold font-serif">
            Join BlogX to {triggerLabel}.
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign up to discover more stories, follow authors, and join the
            conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {/* We can use specific strategies if configured in Clerk, but simplified for now */}
          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-full font-bold"
              onClick={() => onOpenChange(false)}
            >
              <Mail className="h-4 w-4" />
              Sign up with Email
            </Button>
          </SignInButton>

          <SignInButton mode="modal">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-full font-bold"
              onClick={() => onOpenChange(false)}
            >
              <span className="text-xl font-bold">G</span>
              Sign up with Google
            </Button>
          </SignInButton>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <SignInButton mode="modal">
              <span
                className="cursor-pointer font-bold text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                Sign in
              </span>
            </SignInButton>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
