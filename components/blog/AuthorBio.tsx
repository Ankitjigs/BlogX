import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "./FollowButton";

interface AuthorBioProps {
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio?: string | null;
  };
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
}

export default function AuthorBio({
  author,
  isFollowing,
  followerCount,
  followingCount,
}: AuthorBioProps) {
  const displayName = author.name || "Anonymous Writer";

  // Format number for display
  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  return (
    <div className="mx-auto mt-20 max-w-[720px] border-t border-border pt-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Avatar className="h-20 w-20 border-2 border-background ring-2 ring-border">
          <AvatarImage src={author.image || ""} />
          <AvatarFallback className="text-xl font-bold">
            {displayName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">
                {author.bio || "Writer & Content Creator"}
              </p>
            </div>
            <FollowButton
              authorId={author.id}
              initialIsFollowing={isFollowing}
              className="px-6"
            />
          </div>
          <p className="text-muted-foreground">
            Hi, I&apos;m {displayName.split(" ")[0]}. Thanks for reading my
            posts. Follow me to stay up to date with my latest content.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="font-bold">{formatCount(followerCount)}</span>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold">{formatCount(followingCount)}</span>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
