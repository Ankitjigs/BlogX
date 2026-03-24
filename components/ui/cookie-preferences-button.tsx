"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CookieSettingsModal } from "@/components/ui/cookie-settings-modal";

export function CookiePreferencesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" className="bg-white px-6 dark:bg-[#111]" onClick={() => setOpen(true)}>
        Review Cookie Settings
      </Button>
      <CookieSettingsModal open={open} onOpenChange={setOpen} />
    </>
  );
}
