"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition, type ReactNode } from "react";
import { updateUserProfile } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function ProfileEditDialog({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user?.fullName || "");
  const [bio, setBio] = useState((user?.publicMetadata?.bio as string) || "");

  const handleSave = () => {
    // If no changes, just close
    if (
      name === user?.fullName &&
      bio === (user?.publicMetadata?.bio as string)
    ) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateUserProfile({ name, bio });

        if (user && name !== user.fullName) {
          const [first, ...last] = name.split(" ");
          await user.update({
            firstName: first,
            lastName: last.join(" "),
          });
        }

        // Reload user to get fresh metadata
        await user?.reload();

        toast.success("Profile updated");
        setOpen(false);
      } catch {
        toast.error("Failed to update profile");
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) return;

    try {
      const res = await user.setProfileImage({ file });
      // Sync new URL to DB
      await updateUserProfile({ image: res.publicUrl || undefined });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer overflow-hidden rounded-full">
              {/* Actual Input */}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageUpload}
                disabled={isPending}
              />
              <div className="h-24 w-24 bg-muted rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
                <img
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Click to upload a new avatar
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isPending}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/160
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
