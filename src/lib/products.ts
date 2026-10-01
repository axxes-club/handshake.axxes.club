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
const BASE_PRODUCTS: Product[] = [
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
    key: "folders", name: "Folders", category: "Work", color: "#3b82f6", url: "https://folders.axxes.club", sso: true,
    tagline: "Store, organize and share files",
    description: "A fast, familiar file library with folders, previews, share links and upload-from-phone.",
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
    key: "qortr", name: "Rooms", category: "Events", color: "#22d3ee", url: "https://qortr.axxes.club", status: "beta",
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
    key: "manifest", name: "Stock", category: "Commerce", color: "#c8ff3d", url: "https://manifest.axxes.club", sso: true, status: "beta",
    tagline: "Every number explains itself",
    description: "Purchasing, fulfilment, transfers and quality on one honest ledger. Immovable stock moves, mistakes reversed rather than edited, and a cost layer that can be read line by line.",
  },
  {
    key: "api", name: "AXXES for Builders", category: "Developers", color: "#94a3b8", url: "https://api.axxes.club", status: "live",
    tagline: "Put your event on AXXES",
    description: "Events, ticket types, orders and check-ins as an API, plus webhooks. Built for teams shipping their own product on top of ours.",
  },
];

// v2 is isolated: only products deployed into its domain may be launched.
export const FALLBACK_PRODUCTS: Product[] = BASE_PRODUCTS.map((product) => {
  if (process.env.NEXT_PUBLIC_AXXES_ENV !== "v2") return product;
  const host = new URL(product.url).hostname;
  const supported = new Set(["members", "lanes", "folders", "nexus", "pulse", "vibez", "tollbooth", "vitrine", "manifest"]);
  const app = host.endsWith(".axxes.club") ? host.slice(0, -".axxes.club".length) : "";
  if (supported.has(app)) return { ...product, url: `https://${app}.v2.axxes.app` };
  return { ...product, status: "soon", sso: false };
});
