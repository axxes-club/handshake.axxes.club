import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  // Sent here by the OIDC authorize endpoint (another product, e.g. qortr.app): resume that request once signed in
  const oidc = params.client_id
    ? `/api/auth/oauth2/authorize?${new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => e[0] !== "redirect" && typeof e[1] === "string"))}`
    : null;
  const next = oidc ?? safeRedirect(params.redirect);
  // Already signed in: bounce straight back to the app that sent them
  if (await getSession()) redirect(next);
  return <SignInForm next={next} />;
}
