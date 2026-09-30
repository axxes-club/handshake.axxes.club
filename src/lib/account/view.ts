import type { AppSummary, ConnectionInfo } from "./types";
export function confirmedApps(apps: AppSummary[], connections: ConnectionInfo[]): AppSummary[] {
  return apps.filter(a => ["ready", "empty"].includes(a.status) || connections.some(c => c.productKey === a.productKey && c.state === "active"));
}
export function filterData(apps: AppSummary[], query: string): AppSummary[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return apps;
  return apps.filter(a => a.productKey.toLocaleLowerCase().includes(q) || a.recent.some(r => r.title.toLocaleLowerCase().includes(q)) || a.metrics.some(m => m.label.toLocaleLowerCase().includes(q)));
}
