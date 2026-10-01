import "server-only";
import { sql } from "drizzle-orm";
import { db } from "./db";

/**
 * A white-label customer's sign-in branding, read from the shared database:
 * `tenants.settings.whiteLabel` (on/off, address, sign-in wording) and the
 * tenant's `brand_profiles` row (name, colors, logos). members.axxes.club's
 * White-label admin writes both; this only reads them.
 */
export type SignInBrand = {
  slug: string;
  name: string;
  headline: string;
  tagline: string | null;
  notice: string | null;
  accent: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  bannerUrl: string | null;
  faviconUrl: string | null;
};

const DEFAULT_ACCENT = "#0f6cbd";

type Localized = { es?: string; en?: string } | undefined;

function pick(value: Localized, locale: string): string | null {
  if (!value || typeof value !== "object") return null;
  const order = locale.startsWith("es") ? [value.es, value.en] : [value.en, value.es];
  return order.find((v): v is string => typeof v === "string" && v.trim().length > 0)?.trim() ?? null;
}

const hex = (v: unknown) => (typeof v === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim()) ? v.trim() : null);
const url = (v: unknown) => {
  if (typeof v !== "string" || !v.trim()) return null;
  const s = v.trim();
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
};

/** The live customer at this address, or null (unknown, or switched off). */
export async function signInBrand(slug: string, locale: string): Promise<SignInBrand | null> {
  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,40}$/.test(clean)) return null;

  const result = await db.execute(sql`
    select t.name as tenant_name, t.settings -> 'whiteLabel' as wl, t.logo_url as tenant_logo, t.primary_color as tenant_color,
           b.brand_name, b.tagline, b.primary_color, b.logo_url, b.logo_dark_url, b.banner_url, b.favicon_url, t.banner_url as tenant_banner
    from tenants t
    left join brand_profiles b on b.tenant_id = t.id
    where t.deleted_at is null
      and t.settings -> 'whiteLabel' ->> 'slug' = ${clean}
      and (t.settings -> 'whiteLabel' ->> 'enabled')::boolean is true
    limit 1
  `);
  const row = (result as unknown as { rows: Record<string, unknown>[] }).rows?.[0];
  if (!row) return null;

  const wl = (row.wl ?? {}) as { login?: { headline?: Localized; tagline?: Localized; notice?: Localized } };
  const name = (typeof row.brand_name === "string" && row.brand_name) || String(row.tenant_name);
  return {
    slug: clean,
    name,
    headline: pick(wl.login?.headline, locale) ?? name,
    tagline: pick(wl.login?.tagline, locale) ?? (typeof row.tagline === "string" && row.tagline ? row.tagline : null),
    notice: pick(wl.login?.notice, locale),
    accent: hex(row.primary_color) ?? hex(row.tenant_color) ?? DEFAULT_ACCENT,
    logoUrl: url(row.logo_url) ?? url(row.tenant_logo),
    logoDarkUrl: url(row.logo_dark_url),
    bannerUrl: url(row.banner_url) ?? url(row.tenant_banner),
    faviconUrl: url(row.favicon_url),
  };
}

/** The visitor's preferred language from Accept-Language: Spanish or English. */
export function preferredLocale(acceptLanguage: string | null): "es" | "en" {
  const first = (acceptLanguage ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("es") ? "es" : "en";
}
