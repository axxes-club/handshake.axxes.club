import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, asc, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tenantMemberships, tenants, user as userTable } from "@/lib/schema";
import { PRODUCTS } from "@/lib/products";
import { Brand } from "@/components/ui";
import { AccountSettings } from "./account-settings";

export default async function AccountHome() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/sign-in");

  const [sessions, workspaces, [profile]] = await Promise.all([
    auth.api.listSessions({ headers: h }),
    db
      .select({ name: tenants.name, role: tenantMemberships.role })
      .from(tenantMemberships)
      .innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId))
      .where(and(eq(tenantMemberships.userId, session.user.id), isNull(tenantMemberships.deletedAt), isNull(tenants.deletedAt)))
      .orderBy(asc(tenants.name)),
    db.select({ isSuperadmin: userTable.isSuperadmin }).from(userTable).where(eq(userTable.id, session.user.id)),
  ]);

  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
    <div className="min-h-dvh">
      <header className="flex h-16 items-center justify-between px-6">
        <Brand />
        <a href="/sign-out" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">
          Sign out
        </a>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-20">
        <section className="py-10 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white dark:bg-white dark:text-zinc-900">
            {session.user.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Welcome, {firstName}</h1>
          <p className="mt-2 text-zinc-500">
            {session.user.email}
            {profile?.isSuperadmin && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">Superadmin</span>}
          </p>
        </section>

        <section aria-labelledby="apps-heading">
          <h2 id="apps-heading" className="mb-4 text-sm font-medium text-zinc-500">Your apps</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((p) => (
              <a
                key={p.key}
                href={p.status ? undefined : p.url}
                aria-disabled={!!p.status}
                className="group flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm aria-disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white" style={{ background: p.color }}>
                  {p.name[0]}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-medium">
                    {p.name}
                    {p.status === "coming-soon" && <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-normal text-zinc-500 dark:bg-zinc-800">Soon</span>}
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-500">{p.tagline}</span>
                </span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="ws-heading" className="mt-12">
          <h2 id="ws-heading" className="mb-4 text-sm font-medium text-zinc-500">Workspaces</h2>
          <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {workspaces.length === 0 ? (
              <p className="p-5 text-sm text-zinc-500">
                You&apos;re not in a workspace yet.{" "}
                <a href="https://members.axxes.club/onboarding" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">Set one up</a>
              </p>
            ) : (
              workspaces.map((w) => (
                <div key={w.name} className="flex items-center justify-between p-5">
                  <span className="font-medium">{w.name}</span>
                  <span className="text-sm capitalize text-zinc-500">{w.role}</span>
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
