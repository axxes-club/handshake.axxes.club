import { loadAccountOverview } from "@/lib/account/overview";
import { toAccountExport } from "@/lib/account/export";
export async function GET(request: Request) {
  const result = await loadAccountOverview(request.headers, new URL(request.url).searchParams.get("workspace") ?? undefined);
  if (!result.ok) return Response.json({ error: result.status === 401 ? "Sign in to continue" : "Workspace unavailable" }, { status: result.status, headers: { "Cache-Control": "private, no-store" } });
  return new Response(JSON.stringify(toAccountExport(result.overview), null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": 'attachment; filename="axxes-account-overview.json"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
