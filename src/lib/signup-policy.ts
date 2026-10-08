/** Public Pulse registration is scoped to its exact, verified return routes. */
export function isPulseSignupReturn(target: string | null | undefined): boolean {
  if (!target) return false;
  try {
    const url = new URL(target);
    if (url.origin !== "https://pulse.axxes.club" || url.username || url.password) return false;
    if (url.pathname === "/dashboard") return true;
    return url.pathname === "/api/auth/bridge/issue" && /^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get("state") ?? "");
  } catch { return false; }
}
