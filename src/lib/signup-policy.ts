const PULSE_ORIGIN = "https://pulse.axxes.club";

/** Only relative Pulse dashboard pages may survive an auth handoff. */
function dashboardPath(value: string): string | null {
  if (value.length > 2000 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  try {
    const url = new URL(value, PULSE_ORIGIN);
    if (url.origin !== PULSE_ORIGIN || !/^\/dashboard(?:\/|$)/.test(url.pathname) || /%2f|%5c/i.test(url.pathname)) return null;
    const path = url.pathname + url.search;
    return path.length <= 2000 ? path : null;
  } catch { return null; }
}
function pulseTarget(target: string | null | undefined): URL | null {
  if (!target || /[\\\u0000-\u001f\u007f]/.test(target)) return null;
  try {
    const url = new URL(target);
    return url.origin === PULSE_ORIGIN && !url.username && !url.password ? url : null;
  } catch { return null; }
}
/** Recognizes Pulse's dashboard or state-bound bridge, plus the durable password-recovery entry. */
export function pulseReturnPath(target: string | null | undefined): string | null {
  const url = pulseTarget(target);
  if (!url) return null;
  if (/^\/dashboard(?:\/|$)/.test(url.pathname)) return dashboardPath(url.pathname + url.search + url.hash);
  if (url.pathname === "/api/auth/bridge/issue" && /^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get("state") ?? ""))
    return dashboardPath(url.searchParams.get("returnTo") ?? "/dashboard");
  if (url.pathname === "/sign-in") return dashboardPath(url.searchParams.get("returnTo") ?? "/dashboard");
  return null;
}
/** Public signup is restricted to recognized Pulse signup destinations. */
export function isPulseSignupReturn(target: string | null | undefined): boolean {
  const url = pulseTarget(target);
  return !!url && url.pathname !== "/sign-in" && pulseReturnPath(target) !== null;
}
/** Password links outlive the bridge's five-minute state cookie, so restart the bridge after reset. */
export function passwordReturn(target: string): string {
  const path = pulseReturnPath(target);
  return path === null ? target : `${PULSE_ORIGIN}/sign-in?returnTo=${encodeURIComponent(path)}`;
}
/** An abandoned OIDC cookie must not replace an explicit Pulse destination. */
export function signInReturn(next: string, response?: { redirect?: boolean; url?: string } | null): string {
  if (pulseReturnPath(next) !== null) return next;
  return response?.redirect && response.url ? response.url : next;
}
