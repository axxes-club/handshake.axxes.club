export type AccountScope = { kind: "personal" } | { kind: "workspace"; id: string };
export type SummaryStatus = "ready" | "empty" | "unavailable" | "unsupported" | "denied";
export type Metric = { label: string; value: number; unit: string };
export type RecentItem = { id: string; title: string; type: string; updatedAt: string; url: string };
export type AppSummary = {
  version: 1; productKey: string; scope: AccountScope; observedAt: string;
  status: SummaryStatus; metrics: Metric[]; recent: RecentItem[]; entryUrl: string;
  actions: { label: string; url: string }[]; workspaceEntry: "supported" | "choose-in-app";
};
export type WorkspaceInfo = { id: string; name: string; role: string; isPrimary: boolean };
export type ProfileInfo = { name: string; email: string; emailVerified: boolean; image: string | null; joinedAt: string };
export type ConnectionInfo = { id: string; kind: "identity" | "oidc"; name: string; connectedAt: string | null; scopes: string[]; state: "linked" | "active" | "expired"; productKey?: string };
export type BillingInfo = { status: "available"; planName: string; subscriptionStatus: string; periodEnd: string | null; managementUrl: string | null } | { status: "unavailable" | "denied" | "not-applicable" };
export type AccountMetadata = { profile: ProfileInfo; workspaces: WorkspaceInfo[]; connections: ConnectionInfo[] };
export type AccountOverview = AccountMetadata & { scope: AccountScope; apps: AppSummary[]; billing: BillingInfo; observedAt: string };
export type OverviewResult = { ok: true; overview: AccountOverview } | { ok: false; status: 401 | 400 | 403 };
export type AppIntegration = { productKey: string; summaryUrl: string; allowedOrigins: string[]; supportsPersonal: boolean; workspaceEntry: "supported" | "choose-in-app" };
