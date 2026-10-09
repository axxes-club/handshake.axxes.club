// The AXXES product family — the one place Handshake describes what AXXES offers
export type Product = {
  key: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  color: string;
  category: Category;
  status?: "live" | "beta" | "soon";
  sso?: boolean; // signs in with this AXXES account
};

export type Category = "Suite" | "Work" | "Events" | "Commerce" | "Developers";

export const CATEGORIES: { key: Category; blurb: string }[] = [
  { key: "Suite", blurb: "One workspace, one set of numbers." },
  { key: "Work", blurb: "Plan, organize and run the business." },
  { key: "Events", blurb: "The night itself: what was sold, who came, and what they did." },
  { key: "Commerce", blurb: "The money and the stock, reconciled against each other." },
  { key: "Developers", blurb: "Build on AXXES." },
];

/**
 * The hardcoded catalog, kept only as a fallback.
 *
 * The live list is `axxes_product`, read by `getProducts()`. This array exists so
 * a database blip shows the products we know about rather than an empty page —
 * an outage that degrades to "slightly out of date" beats one that degrades to
 * "AXXES sells nothing".
 */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    key: "suite", name: "AXXES Suite", category: "Suite", color: "#ededef", url: "https://members.axxes.club", sso: true,
    tagline: "Everything reconciles here",
    description: "One workspace for the whole business: CRM, events, orders, messages and every AXXES app, all reading from the same numbers.",
  },
  {
    key: "lanes", name: "Lanes", category: "Work", color: "#60a5fa", url: "https://lanes.axxes.club", sso: true,
    tagline: "Boards for every team",
    description: "Kanban boards, sprints and pipelines with checklists, assignees, due dates and Jira-style keys.",
  },
  {
    key: "folders", name: "Folders", category: "Work", color: "#3b82f6", url: "https://folders.axxes.app", sso: true,
    tagline: "Store, organize and share files",
    description: "Personal and business file libraries with folders, previews, sharing and native mobile uploads.",
  },
  {
    key: "nexus", name: "Nexus", category: "Work", color: "#2dd4bf", url: "https://nexus.axxes.club", sso: true, status: "beta",
    tagline: "Your team's knowledge base",
    description: "Docs, wikis and an intranet your team will actually use — linked pages, a graph of everything you know.",
  },
  {
    key: "pulse", name: "Pulse", category: "Work", color: "#ef4444", url: "https://pulse.axxes.club", sso: true, status: "beta",
    tagline: "Live vital signs for your workspace",
    description: "Revenue, audience, events and content at a glance, across every AXXES product you use.",
  },
  {
    key: "afters", name: "afters.am", category: "Events", color: "#f472b6", url: "https://afters.am", status: "live",
    tagline: "Sell the night, run the door",
    description: "Events, tickets, guest lists and scanning. The door count has to match the sales count, and here it does.",
  },
  {
    key: "vibez", name: "Vibez", category: "Events", color: "#ff4d8d", url: "https://vibez.axxes.club", sso: true, status: "beta",
    tagline: "Every room is a photobooth",
    description: "QR codes around the venue open a night-flash camera; every photo lands on a live feed and a TV wall, tagged to the right event.",
  },
  {
    key: "qortr", name: "Qortr", category: "Events", color: "#22d3ee", url: "https://qortr.axxes.club", status: "beta",
    tagline: "The room, booked and paid",
    description: "Book rooms and venues with interactive floor maps and flexible pricing, so the calendar and the till agree.",
  },
  {
    key: "tollbooth", name: "Tollbooth", category: "Commerce", color: "#a78bfa", url: "https://tollbooth.axxes.club", sso: true, status: "beta",
    tagline: "Paid, and paid out",
    description: "Hosted checkout, payouts to your bank, and one reconciliation of what was charged against what actually landed.",
  },
  {
    key: "krates", name: "Krates", category: "Commerce", color: "#f59e0b", url: "https://kr8s.axxes.club", sso: true, status: "live",
    tagline: "The straightforward stock list",
    description: "The plain track: products, variants and stock levels across locations. Signs in separately for now.",
  },
  {
    key: "vitrine", name: "Vitrine", category: "Work", color: "#8a7a5c", url: "https://vitrine.axxes.club", sso: true, status: "beta",
    tagline: "The collection, kept",
    description: "Private collection archives for serious art collections — provenance, condition and legacy in one quiet desk.",
  },
  {
    key: "api", name: "AXXES API", category: "Developers", color: "#94a3b8", url: "https://api.axxes.club", status: "live",
    tagline: "Put your event on AXXES",
    description: "Events, ticket types, orders and check-ins as an API, plus webhooks. Built for teams shipping their own product on top of ours.",
  },
];

/** Owner-only operations and unreleased inventory stay out of discovery. */
export function discoverableProducts<T extends { key: string; name: string; url: string }>(products: T[]): T[] {
  return products.filter(product => {
    if (["manifest", "stock", "webmaster"].includes(product.key.toLowerCase())) return false;
    try {
      const host = new URL(product.url).hostname;
      return !["manifest.axxes.club", "stock.axxes.app", "wm.axxes.app"].includes(host);
    } catch { return false; }
  }).map(product => ({ ...product, name: DISPLAY_NAMES[product.key.toLowerCase()] ?? product.name }));
}

/** Names the owner set; catalog rows may still carry older ones ("Rooms", "AXXES Pay", "AXXES for Builders"). */
const DISPLAY_NAMES: Record<string, string> = { tollbooth: "Tollbooth", qortr: "Qortr", api: "AXXES API" };

// Owner decisions 2026-10-09: these are not advertised on public AXXES pages,
// and products that are not ready ("soon") are never shown there.
const NOT_PROMOTED_KEYS = new Set(["matter", "krates", "vitrine", "keel", "binnacle"]);
const NOT_PROMOTED_HOSTS = new Set(["matter.axxes.app", "matter.axxes.club", "kr8s.axxes.club", "krates.axxes.app", "vitrine.axxes.app", "vitrine.axxes.club", "cloud.axxes.app", "payments.axxes.app", "keel.axxes.club", "binnacle.axxes.club"]);

/**
 * The public list for sign-in, sign-up and /apps. Account pages keep using the
 * full catalog, because they show the apps a person already uses.
 */
export function promotedProducts<T extends { key: string; url: string; status?: string }>(products: T[]): T[] {
  return products.filter(product => {
    if (product.status === "soon" || NOT_PROMOTED_KEYS.has(product.key.toLowerCase())) return false;
    try { return !NOT_PROMOTED_HOSTS.has(new URL(product.url).hostname); } catch { return false; }
  });
}
