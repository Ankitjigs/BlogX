"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookieSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieSettingsModal({ open, onOpenChange }: CookieSettingsModalProps) {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    if (open) {
      const consent = localStorage.getItem("blogx-cookie-consent") || "all";
      if (consent === "essential") {
        setAnalytics(false);
        setMarketing(false);
      } else if (consent === "all") {
        setAnalytics(true);
        setMarketing(true);
      } else {
        try {
          const parsed = JSON.parse(consent);
          setAnalytics(parsed.analytics ?? true);
          setMarketing(parsed.marketing ?? true);
        } catch {
          setAnalytics(true);
          setMarketing(true);
        }
      }
    }
  }, [open]);

  const handleSave = () => {
    if (analytics && marketing) {
      localStorage.setItem("blogx-cookie-consent", "all");
    } else if (!analytics && !marketing) {
      localStorage.setItem("blogx-cookie-consent", "essential");
    } else {
      localStorage.setItem(
        "blogx-cookie-consent",
        JSON.stringify({ essential: true, analytics, marketing })
      );
    }
    onOpenChange(false);
    window.dispatchEvent(new Event("cookie-consent-updated"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Cookie Preferences</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Manage your cookie settings. Strictly necessary cookies cannot be disabled as they are essential for the website to function properly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-100 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-1 pr-4">
              <Label htmlFor="essential" className="font-semibold text-slate-900 dark:text-slate-100">Strictly Necessary</Label>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Required for authentication, security, and rendering the site globally. Cannot be disabled.</p>
            </div>
            <Switch id="essential" checked={true} disabled className="data-[state=checked]:bg-slate-300 dark:data-[state=checked]:bg-slate-600" />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-100 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-1 pr-4">
              <Label htmlFor="analytics" className="font-semibold text-slate-900 dark:text-slate-100">Performance & Analytics</Label>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Help us improve BlogX by tracking anonymous usage metrics and error logs securely.</p>
            </div>
            <Switch id="analytics" checked={analytics} onCheckedChange={setAnalytics} />
          </div>
          <div className="flex items-center justify-between space-x-2 rounded-lg border border-slate-100 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-1 pr-4">
              <Label htmlFor="marketing" className="font-semibold text-slate-900 dark:text-slate-100">Marketing & Targeting</Label>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">Enable features like sharing content to social networks and personalized recommendations.</p>
            </div>
            <Switch id="marketing" checked={marketing} onCheckedChange={setMarketing} />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white dark:bg-[#111]">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-white hover:bg-primary/90">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
