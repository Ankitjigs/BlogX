import { NextRequest, NextResponse } from "next/server";
import { processPendingAiJobs } from "@/lib/ai-jobs";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-ai-job-secret");
  if (!process.env.AI_JOBS_SECRET || secret !== process.env.AI_JOBS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const result = await processPendingAiJobs(Number.isFinite(limit) ? limit : undefined);

  return NextResponse.json({ ok: true, ...result });
}
