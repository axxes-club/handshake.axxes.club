import { discoverableProducts, CATEGORIES, FALLBACK_PRODUCTS, type Category, type Product } from "./products-catalog";
export { CATEGORIES, FALLBACK_PRODUCTS, promotedProducts, type Category, type Product } from "./products-catalog";

/**
 * The live catalog.
 *
 * Read from `axxes_product` — the same table the members portal launcher and
 * developer.axxes.club's plan catalog read — so "what AXXES offers" has one
 * answer. Before this, a new app had to be added to a hardcoded array in this
 * repository *and* to the portal's SQL seed, and a product that reached the
 * suite quietly stayed invisible on the public page until a human noticed.
 *
 * That is the failure this removes: two lists, and no one responsible for the
 * difference between them.
 *
 * Public discovery also excludes Stock/Manifest and private WebMaster operations,
 * independently of the shared catalog's membership visibility.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { db } = await import("./db");
    const { axxesProduct } = await import("./schema");
    const { asc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(axxesProduct)
      .orderBy(asc(axxesProduct.sortOrder));

    if (!rows.length) return discoverableProducts(FALLBACK_PRODUCTS);

    return discoverableProducts(rows.map((r) => ({
      key: r.key,
      name: r.name,
      tagline: r.tagline,
      description: r.description,
      url: r.url,
      color: r.color,
      // A category added to the portal must not blank the page here, so an
      // unknown one falls back to Suite rather than rendering as a group with
      // no heading.
      category: (CATEGORIES.find((c) => c.key === r.category)?.key ??
        "Suite") as Category,
      status: (r.status === "live" || r.status === "beta"
        ? r.status
        : "soon") as Product["status"],
      sso: r.sso,
    })));
  } catch (err) {
    // Never take the public product page down over a query. Log it so it is
    // visible, and show the last-known-good list.
    console.error("[products] falling back to the hardcoded catalog:", err);
    return discoverableProducts(FALLBACK_PRODUCTS);
  }
}

/** The catalog as shown on public pages (sign-in, sign-up, /apps). */
export async function getPromotedProducts(): Promise<Product[]> {
  const { promotedProducts } = await import("./products-catalog");
  return promotedProducts(await getProducts());
}

/** Categories, ordered, with only the ones that actually have products in them. */
export async function getCategories(products: Product[]) {
  const used = new Set(products.map((p) => p.category));
  return CATEGORIES.filter((c) => used.has(c.key));
}
