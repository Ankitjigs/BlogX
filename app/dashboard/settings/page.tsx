import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import SettingsPageContent from "@/components/settings/SettingsPageContent";

export default async function SettingsPage() {
  const { userId } = await auth();

  // If no user, the client component handles the skeleton/loading state via Clerk's useUser,
  // but for our Prisma data, we'll pass null if not authorized or not found.
  let userSettings = null;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        allowComments: true,
        allowPrivateNotes: true,
        allowEmailReplies: true,
        replyToEmail: true,
        acceptTips: true,
      },
    });
    userSettings = dbUser;
  }

  return <SettingsPageContent userSettings={userSettings} />;
}
