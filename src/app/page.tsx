import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenantMemberships, tenants, user as userTable } from "@/lib/schema";
import Link from "next/link";
import { Brand, ProductGrid } from "@/components/ui";
import { getProducts } from "@/lib/products-server";
import { AccountSettings } from "./account-settings";
import { AllAppsSwitcher } from "@/components/all-apps-switcher";

export default async function AccountHome() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/sign-in");

  const [sessions, workspaces, [profile], products] = await Promise.all([
    auth.api.listSessions({ headers: h }),
    db
      .select({ name: tenants.name, role: tenantMemberships.role })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId))
      .where(and(eq(tenantMemberships.userId, session.user.id), isNull(tenantMemberships.deletedAt), isNull(tenants.deletedAt)))
      .orderBy(asc(tenants.name)),
    db.select({ isSuperadmin: userTable.isSuperadmin }).from(userTable).where(eq(userTable.id, session.user.id)),
    getProducts(),
  ]);

  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Brand />
        <nav className="flex items-center gap-1 text-sm">
          <AllAppsSwitcher />
          <a href="/sign-out" className="btn-ghost">Sign out</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-accent font-mono text-xl font-bold text-accent-ink">
            {session.user.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent">AXXES account</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {firstName}</h1>
            <p className="mt-1 text-muted">
              {session.user.email}
              {profile?.isSuperadmin && <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent ring-1 ring-accent/20">Superadmin</span>}
            </p>
          </div>
        </section>

        <section aria-labelledby="apps-heading">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 id="apps-heading" className="text-xl font-semibold tracking-tight">Your apps</h2>
              <p className="text-sm text-muted">Signed in once — open any of them.</p>
            </div>
          </div>
          <ProductGrid compact products={products} />
        </section>

        <section aria-labelledby="ws-heading" className="mt-16">
          <h2 id="ws-heading" className="mb-4 text-xl font-semibold tracking-tight">Workspaces</h2>
          <div className="card divide-y divide-line">
            {workspaces.length === 0 ? (
              <p className="p-5 text-sm text-muted">
                You&apos;re not in a workspace yet.{" "}
                <a href="https://members.axxes.club/onboarding" className="text-accent hover:underline">Set one up</a>
              </p>
            ) : (
              workspaces.map((w) => (
                <div key={w.name} className="flex items-center justify-between p-5">
                  <span className="font-medium">{w.name}</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">{w.role}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <AccountSettings
          name={session.user.name}
          currentToken={session.session.token}
          sessions={sessions.map((s) => ({
            token: s.token,
            userAgent: s.userAgent ?? null,
            ipAddress: s.ipAddress ?? null,
            createdAt: new Date(s.createdAt).toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
