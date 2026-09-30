import type { AccountScope, AppSummary, Metric, RecentItem, SummaryStatus } from "./types";
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 500): v is string => typeof v === "string" && v.length > 0 && v.length <= max;
const date = (v: unknown): v is string => text(v, 50) && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));
export function sameScope(a: unknown, b: AccountScope): boolean {
  return object(a) && a.kind === b.kind && (b.kind === "personal" || a.id === b.id);
}
export function allowedUrl(value: unknown, origins: string[]): value is string {
  if (!text(value, 2048)) return false;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && origins.includes(url.origin); } catch { return false; }
}
export function validateSummary(input: unknown, expected: { productKey: string; scope: AccountScope; allowedOrigins: string[] }): AppSummary | null {
  if (!object(input) || input.version !== 1 || input.productKey !== expected.productKey || !sameScope(input.scope, expected.scope) || !date(input.observedAt)) return null;
  if (!["ready", "empty", "unavailable", "unsupported", "denied"].includes(String(input.status)) || !allowedUrl(input.entryUrl, expected.allowedOrigins)) return null;
  if (!Array.isArray(input.metrics) || input.metrics.length > 12 || !Array.isArray(input.recent) || input.recent.length > 5 || !Array.isArray(input.actions) || input.actions.length > 8) return null;
  const metrics: Metric[] = [], recent: RecentItem[] = [], actions: AppSummary["actions"] = [];
  for (const m of input.metrics) {
    if (!object(m) || !text(m.label, 100) || !text(m.unit, 50) || typeof m.value !== "number" || !Number.isFinite(m.value) || m.value < 0) return null;
    metrics.push({ label: m.label, value: m.value, unit: m.unit });
  }
  for (const r of input.recent) {
    if (!object(r) || !text(r.id, 200) || !text(r.title) || !text(r.type, 80) || !date(r.updatedAt) || !allowedUrl(r.url, expected.allowedOrigins)) return null;
    recent.push({ id: r.id, title: r.title, type: r.type, updatedAt: r.updatedAt, url: r.url });
  }
  for (const a of input.actions) {
    if (!object(a) || !text(a.label, 100) || !allowedUrl(a.url, expected.allowedOrigins)) return null;
    actions.push({ label: a.label, url: a.url });
  }
  const status = input.status as SummaryStatus;
  if (!["ready", "empty"].includes(status) && (metrics.length || recent.length || actions.length)) return null;
  if (status === "empty" && (recent.length || metrics.some(m => m.value !== 0))) return null;
  if (input.workspaceEntry !== "supported" && input.workspaceEntry !== "choose-in-app") return null;
  return { version: 1, productKey: expected.productKey, scope: expected.scope, observedAt: input.observedAt, status, metrics, recent, entryUrl: input.entryUrl, actions, workspaceEntry: input.workspaceEntry };
}
