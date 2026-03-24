import prisma from "@/lib/db";
import providerManager from "@/llm/provider-manager";
import {
  SYSTEM_PROMPTS,
  buildPostSummaryPrompt,
  buildPublishChecksPrompt,
} from "@/llm/prompts";
import { createPostContentHash, extractTextFromTiptapContent } from "@/llm/content";
import { PostSummarySchema, PublishChecksSchema } from "@/types/llm";
import { AiJobStatus, AiJobType, AiSnapshotTaskType } from "@prisma/client";

const DEFAULT_JOB_BATCH_SIZE = 10;

function getBackoffMinutes(attempts: number): number {
  return Math.min(30, Math.max(1, attempts * 2));
}

export async function enqueuePostSummaryJob(input: {
  postId: string;
  contentHash: string;
}) {
  const dedupeKey = `${AiJobType.POST_SUMMARY}:${input.postId}:${input.contentHash}`;

  await prisma.aiJob.upsert({
    where: { dedupeKey },
    update: {
      status: AiJobStatus.PENDING,
      runAt: new Date(),
      payload: { contentHash: input.contentHash },
      lastError: null,
    },
    create: {
      type: AiJobType.POST_SUMMARY,
      postId: input.postId,
      dedupeKey,
      payload: { contentHash: input.contentHash },
      status: AiJobStatus.PENDING,
    },
  });
}

export async function processPendingAiJobs(limit = DEFAULT_JOB_BATCH_SIZE) {
  const now = new Date();
  const jobs = await prisma.aiJob.findMany({
    where: {
      status: AiJobStatus.PENDING,
      runAt: { lte: now },
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results = {
    total: jobs.length,
    completed: 0,
    failed: 0,
    skipped: 0,
  };

  for (const job of jobs) {
    const claimed = await prisma.aiJob.updateMany({
      where: { id: job.id, status: AiJobStatus.PENDING },
      data: { status: AiJobStatus.PROCESSING, lockedAt: new Date() },
    });
    if (claimed.count === 0) {
      results.skipped += 1;
      continue;
    }

    try {
      if (job.type === AiJobType.POST_SUMMARY) {
        const payload = (job.payload || {}) as { contentHash?: string };
        await generateAndPersistPostSummary(job.postId, payload.contentHash);
      }

      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: AiJobStatus.COMPLETED,
          attempts: { increment: 1 },
          lockedAt: null,
          lastError: null,
        },
      });
      results.completed += 1;
    } catch (error) {
      const attempts = job.attempts + 1;
      const maxAttempts = job.maxAttempts;
      const isTerminal = attempts >= maxAttempts;
      const nextStatus = isTerminal ? AiJobStatus.FAILED : AiJobStatus.PENDING;
      const runAt = new Date(
        Date.now() + getBackoffMinutes(attempts) * 60 * 1000,
      );

      await prisma.aiJob.update({
        where: { id: job.id },
        data: {
          status: nextStatus,
          attempts: { increment: 1 },
          runAt: isTerminal ? job.runAt : runAt,
          lockedAt: null,
          lastError:
            error instanceof Error ? error.message : "Unknown processing error",
        },
      });
      results.failed += 1;
    }
  }

  return results;
}

export async function generateAndPersistPostSummary(
  postId: string,
  expectedHash?: string,
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  });
  if (!post || !post.published) return;

  const contentText = extractTextFromTiptapContent(post.content);
  const contentHash = createPostContentHash({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
  });

  if (expectedHash && contentHash !== expectedHash) {
    return;
  }

  const result = await providerManager.generateJson({
    task: "post_summary",
    system: SYSTEM_PROMPTS.postSummary,
    prompt: buildPostSummaryPrompt({
      title: post.title,
      excerpt: post.excerpt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      tags: post.tags.map((t) => t.name),
      contentText,
    }),
    schema: PostSummarySchema,
  });

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: {
        aiSummaryShort: result.data.short,
        aiSummaryLong: result.data.long,
        aiSummaryBullets: result.data.bullets,
        aiSummaryHash: contentHash,
        aiSummaryGeneratedAt: new Date(),
      },
    }),
    prisma.postAiSnapshot.create({
      data: {
        postId,
        taskType: AiSnapshotTaskType.POST_SUMMARY,
        contentHash,
        provider: result.provider,
        model: result.model,
        output: result.data,
      },
    }),
  ]);
}

export async function generateAndPersistPublishChecks(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true },
  });
  if (!post) throw new Error("Post not found");

  const contentText = extractTextFromTiptapContent(post.content);
  const contentHash = createPostContentHash({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
  });

  const result = await providerManager.generateJson({
    task: "publish_checks",
    system: SYSTEM_PROMPTS.publishChecks,
    prompt: buildPublishChecksPrompt({
      title: post.title,
      excerpt: post.excerpt,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      tags: post.tags.map((t) => t.name),
      contentText,
    }),
    schema: PublishChecksSchema,
  });

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: {
        aiChecks: result.data,
        aiChecksHash: contentHash,
        aiChecksGeneratedAt: new Date(),
      },
    }),
    prisma.postAiSnapshot.create({
      data: {
        postId,
        taskType: AiSnapshotTaskType.PUBLISH_CHECKS,
        contentHash,
        provider: result.provider,
        model: result.model,
        output: result.data,
      },
    }),
  ]);

  return result.data;
}
