import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirect } from "@/lib/redirect";
import { preferredLocale, signInBrand } from "@/lib/white-label";
import { SignInForm } from "../../sign-in/sign-in-form";

/** Where a customer's people land after signing in, unless a product sent them here. */
const DEFAULT_LANDING = "https://members.axxes.club";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await signInBrand(slug, preferredLocale((await headers()).get("accept-language")));
  if (!brand) return { title: "Sign in" };
  return {
    title: brand.name,
    icons: brand.faviconUrl ? { icon: brand.faviconUrl } : undefined,
  };
}

/**
 * A white-label customer's own sign-in page: handshake.axxes.club/o/<slug>.
 * Same account, same session as the standard page — only the dress differs —
 * so signing in here opens every *.axxes.club product the customer uses.
 */
export default async function WhiteLabelSignInPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = preferredLocale((await headers()).get("accept-language"));
  const brand = await signInBrand(slug, locale);
  if (!brand) notFound();

  const next = safeRedirect(query.redirect, DEFAULT_LANDING);
  if (await getSession()) redirect(next);
  return <SignInForm next={next} brand={brand} locale={locale} />;
}
