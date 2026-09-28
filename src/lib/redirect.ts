// The parent domain every AXXES app lives under (axxes.club in production)
const PARENT_DOMAIN = (process.env.AUTH_COOKIE_DOMAIN || "axxes.club").replace(/^\./, "");

// Only send people back to AXXES properties after signing in
export function safeRedirect(target: string | null | undefined, fallback = "/"): string {
  if (!target) return fallback;
  if (target.startsWith("/") && !target.startsWith("//")) return target;
  try {
    const url = new URL(target);
    const host = url.hostname;
    const inFamily = host === PARENT_DOMAIN || host.endsWith(`.${PARENT_DOMAIN}`);
    const secureEnough = url.protocol === "https:" || process.env.NODE_ENV !== "production" || process.env.ALLOW_HTTP_REDIRECTS === "true";
    if (inFamily && secureEnough) return url.toString();
  } catch {}
  return fallback;
}
