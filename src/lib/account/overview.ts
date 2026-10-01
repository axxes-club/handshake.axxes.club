import { getProducts } from "../products-server";
import { loadAccountMetadata } from "./store";
import { resolveAccountScope } from "./scope";
import { getIntegration } from "./registry";
import { fetchAppSummary, unavailableSummary } from "./summaries";
import type { OverviewResult } from "./types";
function safeEntry(value: string): string {
  try { const u = new URL(value); if (u.protocol === "https:" && !u.username && !u.password) return u.href; } catch {}
  return "https://handshake.axxes.club/apps";
}
export async function loadAccountOverview(headers: Headers, requestedScope?: string): Promise<OverviewResult> {
  const metadata = await loadAccountMetadata(headers);
  if (!metadata) return { ok: false, status: 401 };
  const selected = resolveAccountScope(requestedScope, metadata.workspaces);
  if (!selected.ok) return selected;
  const products = await getProducts();
  const apps = await Promise.all(products.map(p => {
    const integration = getIntegration(p.key);
    return integration ? fetchAppSummary(integration, selected.scope, headers) : unavailableSummary(p.key, selected.scope, safeEntry(p.url), "unsupported");
  }));
  return { ok: true, overview: { ...metadata, scope: selected.scope, apps, billing: { status: selected.scope.kind === "personal" ? "not-applicable" : "unavailable" }, observedAt: new Date().toISOString() } };
}
