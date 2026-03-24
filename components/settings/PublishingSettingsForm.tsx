"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updatePublishingSettings } from "@/actions/settings";
import { Loader2, Mail, MessageSquare, DollarSign, Upload } from "lucide-react";
import { Prisma } from "@prisma/client";

// Define a type that matches the User model fields we care about
// Since we can't easily import the full User type with all relations here without client component issues
type UserSettings = {
  allowComments: boolean;
  allowPrivateNotes: boolean;
  allowEmailReplies: boolean;
  replyToEmail: string | null;
  acceptTips: boolean;
};

interface PublishingSettingsFormProps {
  initialSettings: UserSettings;
}

export function PublishingSettingsForm({
  initialSettings,
}: PublishingSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: Exclude<keyof UserSettings, "replyToEmail">) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasChanges(true); // Simplified tracking
      return updated;
    });
  };

  const handleChange = (key: keyof UserSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updatePublishingSettings(settings);
        toast.success("Publishing settings saved");
        setHasChanges(false);
      } catch (error) {
        toast.error("Failed to save settings");
      }
    });
  };

  const handleImport = () => {
    toast.info("Subscriber import coming soon!");
  };

  return (
    <div className="space-y-10 max-w-2xl">
      {/* 1. Reader Interaction */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Reader Interaction</h3>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Allow comments</Label>
            <p className="text-sm text-muted-foreground">
              Let readers leave comments on your posts.
            </p>
          </div>
          <Switch
            checked={settings.allowComments}
            onCheckedChange={() => handleToggle("allowComments")}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Private feedback</Label>
            <p className="text-sm text-muted-foreground">
              Allow readers to leave private notes on your content.
            </p>
          </div>
          <Switch
            checked={settings.allowPrivateNotes}
            onCheckedChange={() => handleToggle("allowPrivateNotes")}
          />
        </div>
      </section>

      <Separator />

      {/* 2. Email & Distribution */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Email & Distribution</h3>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Allow email replies</Label>
            <p className="text-sm text-muted-foreground">
              Readers can reply directly to your newsletters.
            </p>
          </div>
          <Switch
            checked={settings.allowEmailReplies}
            onCheckedChange={() => handleToggle("allowEmailReplies")}
          />
        </div>

        {settings.allowEmailReplies && (
          <div className="space-y-2 pl-4 border-l-2 border-primary/20">
            <Label htmlFor="replyTo">Reply-to email</Label>
            <Input
              id="replyTo"
              placeholder="you@example.com"
              value={settings.replyToEmail || ""}
              onChange={(e) => handleChange("replyToEmail", e.target.value)}
              className="max-w-md"
            />
          </div>
        )}
      </section>

      <Separator />

      {/* 3. Monetization */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Monetization</h3>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4 bg-secondary/20">
          <div className="space-y-0.5">
            <Label className="text-base">Accept Tips</Label>
            <p className="text-sm text-muted-foreground">
              Allow readers to support your work with one-time tips.
              <span className="ml-2 inline-flex items-center rounded-sm bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Beta
              </span>
            </p>
          </div>
          <Switch
            checked={settings.acceptTips}
            onCheckedChange={() => handleToggle("acceptTips")}
          />
        </div>
      </section>

      <Separator />

      {/* 4. Import */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Import Subscribers</h3>
        </div>

        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Bring your audience with you. Import your existing email list.
          </p>
          <Button variant="outline" onClick={handleImport}>
            Import from CSV
          </Button>
        </div>
      </section>

      {/* Save Action */}
      <div className="sticky bottom-6 flex justify-end">
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="shadow-xl"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        )}
      </div>
    </div>
  );
}
