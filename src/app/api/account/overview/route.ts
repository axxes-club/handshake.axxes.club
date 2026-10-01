import { loadAccountOverview } from "@/lib/account/overview";
export async function GET(request: Request) {
  const result = await loadAccountOverview(request.headers, new URL(request.url).searchParams.get("workspace") ?? undefined);
  return Response.json(result.ok ? result.overview : { error: result.status === 401 ? "Sign in to continue" : "Workspace unavailable" }, { status: result.ok ? 200 : result.status, headers: { "Cache-Control": "private, no-store" } });
}
