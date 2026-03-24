"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function NotificationsTab() {
  const [emailfollows, setEmailFollows] = useState(true);
  const [emailMentions, setEmailMentions] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [pushInteractions, setPushInteractions] = useState(true);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Email Notifications</h3>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label className="text-base">New Followers</Label>
            <p className="text-sm text-muted-foreground">
              Email me when someone follows me
            </p>
          </div>
          <Switch checked={emailfollows} onCheckedChange={setEmailFollows} />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label className="text-base">Mentions & Replies</Label>
            <p className="text-sm text-muted-foreground">
              Email me when someone mentions me or replies to my post
            </p>
          </div>
          <Switch checked={emailMentions} onCheckedChange={setEmailMentions} />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label className="text-base">Product Updates</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates about new features and improvements
            </p>
          </div>
          <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Push Notifications</h3>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label className="text-base">Interactions</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications for likes, comments, and follows
            </p>
          </div>
          <Switch
            checked={pushInteractions}
            onCheckedChange={setPushInteractions}
          />
        </div>
      </div>
    </div>
  );
}
