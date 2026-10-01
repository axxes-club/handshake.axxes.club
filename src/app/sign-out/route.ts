import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { safeRedirect } from "@/lib/redirect";
import { publicOrigin } from "@/lib/public-origin"

// GET /sign-out?redirect=… — ends the shared session for every AXXES app, then returns
export async function GET(req: NextRequest) {
  const target = safeRedirect(req.nextUrl.searchParams.get("redirect"), "/sign-in");
  const destination = new URL(target, publicOrigin(req));

  const result = await auth.api.signOut({ headers: req.headers, asResponse: true }).catch(() => null);
  const res = NextResponse.redirect(destination);
  result?.headers.getSetCookie().forEach((cookie) => res.headers.append("set-cookie", cookie));
  return res;
}
