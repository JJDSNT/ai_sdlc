type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const baseUrl =
    process.env.AGENT_URL ??
    process.env.NEXT_PUBLIC_AGENT_URL ??
    "http://localhost:3001";

  const response = await fetch(`${baseUrl}/tasks/${id}/events`, {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  if (!response.ok || !response.body) {
    return new Response("Failed to connect to task event stream", {
      status: response.status || 502,
    });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}