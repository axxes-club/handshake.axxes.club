// The parent domain every AXXES app lives under (axxes.club in production)
const PARENT_DOMAIN = (process.env.AUTH_COOKIE_DOMAIN || "axxes.club").replace(/^\./, "");

// Only send people back to AXXES properties after signing in
export function safeRedirect(target: string | null | undefined, fallback = "/"): string {
  if (!target || /[\\\u0000-\u001f\u007f]/.test(target)) return fallback;
  try {
    if (target.startsWith("/")) {
      if (target.startsWith("//")) return fallback;
      const origin = `https://${PARENT_DOMAIN}`;
      const local = new URL(target, origin);
      if (local.origin !== new URL(origin).origin) return fallback;
      return local.pathname + local.search + local.hash;
    }
    const url = new URL(target);
    const host = url.hostname;
    const inFamily = host === PARENT_DOMAIN || host.endsWith(`.${PARENT_DOMAIN}`);
    const allowHttp = process.env.NODE_ENV !== "production" || process.env.ALLOW_HTTP_REDIRECTS === "true";
    const secureEnough = url.protocol === "https:" || (url.protocol === "http:" && allowHttp);
    if (inFamily && secureEnough) return url.toString();
  } catch {}
  return fallback;
}
