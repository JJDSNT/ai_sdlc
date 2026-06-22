import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AGENT_URL ?? process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:3001";

const repositoryRoot = process.env.AI_CONTEXT_REPO_ROOT?.trim();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  if (!repositoryRoot) {
    return NextResponse.json(
      { ok: false, error: "AI_CONTEXT_REPO_ROOT não configurado" },
      { status: 500 }
    );
  }

  const { id } = await context.params;
  const body = await request.text();

  try {
    const upstream = await fetch(
      `${baseUrl}/ai-context/specs/${id}/status?repositoryRoot=${encodeURIComponent(repositoryRoot)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        cache: "no-store",
      }
    );

    const text = await upstream.text();

    return new NextResponse(text || JSON.stringify({ ok: false }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "agent_unreachable",
        message: error instanceof Error ? error.message : "Failed to reach agent",
      },
      { status: 502 }
    );
  }
}
