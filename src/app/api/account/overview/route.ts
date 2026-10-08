import {wrapAdmission} from '@/lib/security/admission-server';
import { loadAccountOverview } from "@/lib/account/overview";
async function GETHandler(request: Request) {
  const result = await loadAccountOverview(request.headers, new URL(request.url).searchParams.get("workspace") ?? undefined);
  return Response.json(result.ok ? result.overview : { error: result.status === 401 ? "Sign in to continue" : "Workspace unavailable" }, { status: result.ok ? 200 : result.status, headers: { "Cache-Control": "private, no-store" } });
}

export const GET=wrapAdmission(GETHandler,'src/app/api/account/overview/route.ts'+':GET',12000);
