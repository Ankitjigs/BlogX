"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/interactions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Heart, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  actor: {
    id: string;
    name: string | null;
    image: string | null;
  };
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
  isRead: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getNotifications()
      .then((data) => {
        console.log("Notifications loaded:", data);
        ("@ts-expect-error");
        setNotifications(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err);
        setLoading(false);
      });
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    startTransition(async () => {
      await markNotificationRead(id);
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2 rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-xl">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No notifications yet</h3>
            <p className="text-muted-foreground">
              When someone specifically interacts with you, you’ll see it here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-4 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                notification.isRead
                  ? "bg-muted/60 border-border hover:bg-muted/80"
                  : "bg-card border-primary/20 shadow-sm"
              }`}
            >
              <div className="mt-1">
                {notification.type === "LIKE_POST" && (
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </div>
                )}
                {notification.type === "LIKE_COMMENT" && (
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </div>
                )}
                {notification.type === "COMMENT" && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-500 fill-current" />
                  </div>
                )}
                {notification.type === "FOLLOW" && (
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-green-500" />
                  </div>
                )}
                {notification.type === "REPLY" && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-500 fill-current" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={notification.actor.image || ""} />
                    <AvatarFallback>
                      {notification.actor.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">
                    {notification.actor.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {notification.type === "LIKE_POST" && "liked your post"}
                    {notification.type === "LIKE_COMMENT" &&
                      "liked your comment"}
                    {notification.type === "COMMENT" &&
                      "commented on your post"}
                    {notification.type === "FOLLOW" && "started following you"}
                    {notification.type === "REPLY" && "replied to your comment"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    •{" "}
                    {notification.createdAt
                      ? formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </div>

                {notification.post && (
                  <Link
                    href={`/posts/${notification.post.slug}`}
                    className="block font-medium hover:underline decoration-primary"
                  >
                    {notification.post.title}
                  </Link>
                )}

                {notification.comment && (
                  <div className="text-sm text-muted-foreground border-l-2 pl-3 mt-2 line-clamp-2">
                    &quot;{notification.comment.content}&quot;
                  </div>
                )}

                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-all hover:bg-primary/20"
                  >
                    <Check className="h-3 w-3" />
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
