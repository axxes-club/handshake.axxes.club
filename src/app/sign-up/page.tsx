import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getProducts } from "@/lib/products";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ redirect?: string; code?: string }> }) {
  const { redirect: target, code } = await searchParams;
  // New accounts continue to Suite onboarding unless an app asked for somewhere else
  const next = safeRedirect(target, "https://members.axxes.club/onboarding");
  if (await getSession()) redirect(next);
  return <SignUpForm products={await getProducts()} next={next} initialCode={code ?? ""} />;
}
