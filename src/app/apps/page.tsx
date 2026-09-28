import type { Metadata } from "next";
import Link from "next/link";
import { Brand, ProductGrid } from "@/components/ui";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "AXXES products", robots: { index: true, follow: true } };

export default async function AppsPage() {
  const session = await getSession();
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Brand />
        <Link href={session ? "/" : "/sign-in"} className="btn-primary">{session ? "Your account" : "Sign in"}</Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="py-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">The AXXES family</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Software for venues, promoters and the businesses around them.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Use one app or all of them. The AXXES Suite brings every product together in one workspace, and one AXXES account signs you in everywhere.</p>
        </section>
        <ProductGrid />
      </main>
    </div>
  );
}
