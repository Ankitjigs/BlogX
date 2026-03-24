"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import providerManager from "@/llm/provider-manager";
import {
  EditorFieldSuggestionsSchema,
  RewriteSelectionSchema,
  type EditorSuggestionField,
} from "@/types/llm";
import {
  SYSTEM_PROMPTS,
  buildFieldSuggestionPrompt,
  buildRewritePrompt,
} from "@/llm/prompts";
import { extractTextFromTiptapContent } from "@/llm/content";
import { generateAndPersistPublishChecks } from "@/lib/ai-jobs";

async function getOwnedPostForAi(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  });

  if (!post || post.authorId !== userId) {
    throw new Error("Unauthorized or Post not found");
  }

  return post;
}

export async function generateFieldSuggestions(input: {
  postId: string;
  field: EditorSuggestionField;
}) {
  const post = await getOwnedPostForAi(input.postId);
  const contentText = extractTextFromTiptapContent(post.content);

  const result = await providerManager.generateJson({
    task: "editor_suggestions",
    system: SYSTEM_PROMPTS.editorSuggestions,
    prompt: buildFieldSuggestionPrompt({
      field: input.field,
      post: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        tags: post.tags.map((t) => t.name),
        contentText,
      },
    }),
    schema: EditorFieldSuggestionsSchema,
  });

  return result.data;
}

export async function rewriteSelection(input: {
  postId: string;
  selectedText: string;
  instruction: string;
}) {
  const post = await getOwnedPostForAi(input.postId);
  const selectedText = input.selectedText?.trim();
  const instruction = input.instruction?.trim();

  if (!selectedText) throw new Error("Please select text to rewrite.");
  if (!instruction) throw new Error("Instruction is required.");

  const contentText = extractTextFromTiptapContent(post.content);

  const result = await providerManager.generateJson({
    task: "rewrite_selection",
    system: SYSTEM_PROMPTS.rewriteSelection,
    prompt: buildRewritePrompt({
      selectedText,
      instruction,
      postContext: contentText.slice(0, 4000),
    }),
    schema: RewriteSelectionSchema,
  });

  return result.data;
}

export async function generatePublishChecks(postId: string) {
  await getOwnedPostForAi(postId);
  return await generateAndPersistPublishChecks(postId);
}
