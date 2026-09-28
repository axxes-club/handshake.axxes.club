import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect: target } = await searchParams;
  const next = safeRedirect(target);
  // Already signed in: bounce straight back to the app that sent them
  if (await getSession()) redirect(next);
  return <SignInForm next={next} />;
}
