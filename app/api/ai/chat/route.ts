import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { extractTextFromTiptapContent } from "@/llm/content";
import { buildChatSystemPrompt, toGeminiContents } from "@/llm/chat";
import type { ChatMessage } from "@/types/llm";

const CHAT_MODEL = "gemini-2.5-flash";

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const messages: ChatMessage[] = body.messages ?? [];
  const postId: string | undefined = body.postId;

  if (!messages.length) {
    return new Response("No messages provided", { status: 400 });
  }

  let systemPrompt: string;

  if (postId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        title: true,
        excerpt: true,
        content: true,
        tags: true,
        authorId: true,
      },
    });

    if (!post || post.authorId !== userId) {
      return new Response("Post not found", { status: 404 });
    }

    systemPrompt = buildChatSystemPrompt({
      title: post.title,
      excerpt: post.excerpt,
      tags: post.tags.map((t) => t.name),
      contentText: extractTextFromTiptapContent(post.content),
    });
  } else {
    systemPrompt = buildChatSystemPrompt();
  }

  const client = getClient();
  const contents = toGeminiContents(messages);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.models.generateContentStream({
          model: CHAT_MODEL,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
        }

        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ error: "Failed to generate response" })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
