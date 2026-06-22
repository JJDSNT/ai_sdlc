import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AGENT_URL ?? process.env.NEXT_PUBLIC_AGENT_URL ?? "http://localhost:3001";

// AI_context vive no próprio repositório do agent (dogfood). Decisão
// registrada em ISSUE-0009/ISSUE-0010: enquanto `projects` não tiver um
// campo de path, repositoryRoot fica fixo via env, resolvido aqui no
// servidor (nunca exposto ao client).
const repositoryRoot = process.env.AI_CONTEXT_REPO_ROOT?.trim();

export async function GET(request: NextRequest) {
  if (!repositoryRoot) {
    return NextResponse.json(
      { ok: false, error: "AI_CONTEXT_REPO_ROOT não configurado" },
      { status: 500 }
    );
  }

  const search = new URLSearchParams(request.nextUrl.search);
  search.set("repositoryRoot", repositoryRoot);

  try {
    const upstream = await fetch(`${baseUrl}/ai-context/issues?${search.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text || JSON.stringify({ ok: true, issues: [] }), {
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
