export async function POST(request: Request) {
  const body = await request.text();

  const baseUrl =
    process.env.AGENT_URL ??
    process.env.NEXT_PUBLIC_AGENT_URL ??
    "http://localhost:3001";

  const response = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}