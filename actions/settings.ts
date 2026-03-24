"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type PublishingSettingsData = {
  allowComments?: boolean;
  allowPrivateNotes?: boolean;
  allowEmailReplies?: boolean;
  replyToEmail?: string | null;
  acceptTips?: boolean;
};

export async function updatePublishingSettings(data: PublishingSettingsData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: {
      allowComments: data.allowComments,
      allowPrivateNotes: data.allowPrivateNotes,
      allowEmailReplies: data.allowEmailReplies,
      replyToEmail: data.replyToEmail,
      acceptTips: data.acceptTips,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}
