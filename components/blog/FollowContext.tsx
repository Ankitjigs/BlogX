"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface FollowState {
  [authorId: string]: boolean;
}

interface FollowContextType {
  getFollowState: (authorId: string) => boolean | undefined;
  setFollowState: (authorId: string, isFollowing: boolean) => void;
}

const FollowContext = createContext<FollowContextType | null>(null);

interface FollowProviderProps {
  children: ReactNode;
  initialStates?: { authorId: string; isFollowing: boolean }[];
}

export function FollowProvider({
  children,
  initialStates = [],
}: FollowProviderProps) {
  const [followStates, setFollowStates] = useState<FollowState>(() => {
    const initial: FollowState = {};
    initialStates.forEach(({ authorId, isFollowing }) => {
      initial[authorId] = isFollowing;
    });
    return initial;
  });

  const getFollowState = useCallback(
    (authorId: string) => followStates[authorId],
    [followStates],
  );

  const setFollowState = useCallback(
    (authorId: string, isFollowing: boolean) => {
      setFollowStates((prev) => ({ ...prev, [authorId]: isFollowing }));
    },
    [],
  );

  const value = useMemo(
    () => ({ getFollowState, setFollowState }),
    [getFollowState, setFollowState],
  );

  return (
    <FollowContext.Provider value={value}>{children}</FollowContext.Provider>
  );
}

export function useFollowContext() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollowContext must be used within a FollowProvider");
  }
  return context;
}

// Optional hook for when context might not be available
export function useFollowContextOptional() {
  return useContext(FollowContext);
}
