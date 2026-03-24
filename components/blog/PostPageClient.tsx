"use client";

import { ReactNode } from "react";
import { FollowProvider } from "@/components/blog/FollowContext";

interface PostPageClientProps {
  children: ReactNode;
  authorId: string;
  isFollowing: boolean;
}

export default function PostPageClient({
  children,
  authorId,
  isFollowing,
}: PostPageClientProps) {
  return (
    <FollowProvider initialStates={[{ authorId, isFollowing }]}>
      {children}
    </FollowProvider>
  );
}
