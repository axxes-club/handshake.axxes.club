import type { AccountOverview } from "./types";
export function toAccountExport(overview: AccountOverview) {
  const { name, email, emailVerified, image, joinedAt } = overview.profile;
  return { format: "AXXES account overview", version: 1, description: "Account metadata and available app summaries. Download full app records in the owning app.", observedAt: overview.observedAt,
    profile: { name, email, emailVerified, image, joinedAt },
    scope: overview.scope.kind === "personal" ? { kind: "personal" } : { kind: "workspace", id: overview.scope.id },
    workspaces: overview.workspaces.map(({ id, name, role, isPrimary }) => ({ id, name, role, isPrimary })),
    connections: overview.connections.map(({ id, kind, name, connectedAt, scopes, state }) => ({ id, kind, name, connectedAt, scopes, state })),
    billing: overview.billing.status === "available" ? { status: "available", planName: overview.billing.planName, subscriptionStatus: overview.billing.subscriptionStatus, periodEnd: overview.billing.periodEnd } : { status: overview.billing.status },
    apps: overview.apps.map(a => ({ productKey: a.productKey, status: a.status, observedAt: a.observedAt, metrics: a.metrics.map(({ label, value, unit }) => ({ label, value, unit })), recent: a.recent.map(({ id, title, type, updatedAt, url }) => ({ id, title, type, updatedAt, url })), entryUrl: a.entryUrl })),
  };
}
