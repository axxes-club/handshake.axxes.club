import type { AccountScope, AppIntegration, AppSummary, SummaryStatus } from "./types";
import { validateSummary } from "./summary-contract";
export function unavailableSummary(productKey: string, scope: AccountScope, entryUrl: string, status: SummaryStatus = "unavailable"): AppSummary {
  return { version: 1, productKey, scope, observedAt: new Date().toISOString(), status, metrics: [], recent: [], entryUrl, actions: [], workspaceEntry: "choose-in-app" };
}
export function sessionCredential(headers: Headers): string {
  const cookie = headers.get("cookie") ?? "";
  return cookie.split(";").map(s => s.trim()).find(s => s.startsWith("__Secure-better-auth.session_token=")) ?? "";
}
export async function fetchAppSummary(integration: AppIntegration, scope: AccountScope, headers: Headers): Promise<AppSummary> {
  const entryUrl = `${integration.allowedOrigins[0]}/`;
  if (scope.kind === "personal" && !integration.supportsPersonal) return unavailableSummary(integration.productKey, scope, entryUrl, "unsupported");
  const fallback = (status: SummaryStatus = "unavailable") => unavailableSummary(integration.productKey, scope, entryUrl, status);
  try {
    const url = new URL(integration.summaryUrl);
    url.searchParams.set("workspace", scope.kind === "personal" ? "personal" : scope.id);
    const response = await fetch(url, { headers: { cookie: sessionCredential(headers), accept: "application/json" }, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (response.status === 401 || response.status === 403) return fallback("denied");
    if (response.status === 404) return fallback("unsupported");
    if (!response.ok || !response.body) return fallback();
    const reader = response.body.getReader();
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 128 * 1024) { await reader.cancel(); return fallback(); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return validateSummary(JSON.parse(new TextDecoder().decode(bytes)), { productKey: integration.productKey, scope, allowedOrigins: integration.allowedOrigins }) ?? fallback();
  } catch { return fallback(); }
}
