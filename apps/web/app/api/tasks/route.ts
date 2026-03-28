import { NextResponse } from "next/server";

const baseUrl =
  process.env.AGENT_BASE_URL?.trim() || "http://localhost:3001";

export async function GET() {
  try {
    const upstream = await fetch(`${baseUrl}/tasks`, {
      method: "GET",
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text || JSON.stringify({ ok: true, tasks: [] }), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "agent_unreachable",
        message:
          error instanceof Error ? error.message : "Failed to reach agent",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const upstream = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });

    const text = await upstream.text();

    return new NextResponse(text || JSON.stringify({ ok: false }), {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "agent_unreachable",
        message:
          error instanceof Error ? error.message : "Failed to reach agent",
      },
      { status: 502 }
    );
  }
}