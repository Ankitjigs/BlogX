"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

async function ensureUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (dbUser) return dbUser;

  return await prisma.user.create({
    data: {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(),
      image: user.imageUrl,
    },
  });
}

export async function createPrivateNote(input: {
  postId: string;
  content: string;
  selectionText?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await ensureUser();
  if (!user.allowPrivateNotes) {
    throw new Error("Private notes are disabled for this account.");
  }

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: { id: true, authorId: true },
  });

  if (!post || post.authorId !== userId) {
    throw new Error("Unauthorized or Post not found");
  }

  const content = input.content.trim();
  if (!content) throw new Error("Note cannot be empty");

  const note = await prisma.privateNote.create({
    data: {
      postId: input.postId,
      authorId: userId,
      content,
      selectionText: input.selectionText?.trim() || null,
    },
  });

  revalidatePath(`/editor/${input.postId}`);
  return { id: note.id, content: note.content };
}

export async function listPrivateNotes(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post || post.authorId !== userId) {
    throw new Error("Unauthorized or Post not found");
  }

  const notes = await prisma.privateNote.findMany({
    where: { postId, authorId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true },
  });

  return notes;
}

export async function deletePrivateNote(noteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const note = await prisma.privateNote.findUnique({
    where: { id: noteId },
    select: { id: true, authorId: true, postId: true },
  });

  if (!note || note.authorId !== userId) {
    throw new Error("Unauthorized or Note not found");
  }

  await prisma.privateNote.delete({ where: { id: noteId } });
  revalidatePath(`/editor/${note.postId}`);
}

export async function updatePrivateNote(input: {
  noteId: string;
  content: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const content = input.content.trim();
  if (!content) throw new Error("Note cannot be empty");

  const note = await prisma.privateNote.findUnique({
    where: { id: input.noteId },
    select: { id: true, authorId: true, postId: true },
  });

  if (!note || note.authorId !== userId) {
    throw new Error("Unauthorized or Note not found");
  }

  const updated = await prisma.privateNote.update({
    where: { id: input.noteId },
    data: { content },
    select: { id: true, content: true, postId: true },
  });

  revalidatePath(`/editor/${updated.postId}`);
  return { id: updated.id, content: updated.content };
}
