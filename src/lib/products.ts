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

export type Category = "Suite" | "Work" | "Events" | "Commerce" | "Developers" | "Support";

export const CATEGORIES: { key: Category; blurb: string }[] = [
  { key: "Suite", blurb: "One workspace, one set of numbers." },
  { key: "Work", blurb: "Plan, organize and run the business." },
  { key: "Events", blurb: "The night itself: what was sold, who came, and what they did." },
  { key: "Commerce", blurb: "The money and the stock, reconciled against each other." },
  { key: "Developers", blurb: "Build on AXXES." },
  { key: "Support", blurb: "Support your customers with the full picture." },
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
    "key": "suite",
    "name": "AXXES Suite",
    "tagline": "Everything reconciles here",
    "description": "One workspace for the whole business: CRM, events, orders, messages and every AXXES app, all reading from the same numbers.",
    "url": "https://members.axxes.club",
    "color": "#ededef",
    "category": "Suite",
    "status": "live",
    "sso": true
  },
  {
    "key": "lanes",
    "name": "Lanes",
    "tagline": "Boards for every team",
    "description": "Kanban boards, sprints and pipelines with checklists, assignees, due dates and Jira-style keys.",
    "url": "https://lanes.axxes.club",
    "color": "#60a5fa",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "folders",
    "name": "Folders",
    "tagline": "Store, organize and share files",
    "description": "A fast, familiar file library with folders, previews, share links and upload-from-phone.",
    "url": "https://folders.axxes.club",
    "color": "#3b82f6",
    "category": "Work",
    "status": "live",
    "sso": true
  },
  {
    "key": "nexus",
    "name": "Nexus",
    "tagline": "Your team's knowledge base",
    "description": "Docs, wikis and an intranet your team will actually use - linked pages, a graph of everything you know.",
    "url": "https://nexus.axxes.club",
    "color": "#2dd4bf",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "pulse",
    "name": "Pulse",
    "tagline": "Live vital signs for your workspace",
    "description": "Revenue, audience, events and content at a glance, across every AXXES product you use.",
    "url": "https://pulse.axxes.club",
    "color": "#ef4444",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "vitrine",
    "name": "Vitrine",
    "tagline": "The collection, kept",
    "description": "Private collection archives for serious art collections - provenance, condition and legacy in one quiet desk.",
    "url": "https://vitrine.axxes.club",
    "color": "#8a7a5c",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "matter",
    "name": "Matter",
    "tagline": "Succession, with a record of who agreed",
    "description": "One case for a family estate or a business hand-over: the documents, the dates, the people, and an acknowledgement on every version of every document — so 'I have seen this' stops being a claim and becomes a record.",
    "url": "https://matters.axxes.club",
    "color": "#8a7a5c",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "relay",
    "name": "Relay",
    "tagline": "Conversations that live where your team already works.",
    "description": "Direct and group messaging for AXXES: conversations, read\nreceipts, unread counts, typing indicators and realtime delivery. A core suite\nproduct - it signs in with your AXXES account, works inside the members portal,\nand exposes the same conversations over a REST API.",
    "url": "https://relay.axxes.club",
    "color": "#c8ff3d",
    "category": "Work",
    "status": "live",
    "sso": true
  },
  {
    "key": "afters",
    "name": "afters.am",
    "tagline": "Sell the night, run the door",
    "description": "Events, tickets, guest lists and scanning. The door count has to match the sales count, and here it does.",
    "url": "https://afters.am",
    "color": "#f472b6",
    "category": "Events",
    "status": "live",
    "sso": false
  },
  {
    "key": "vibez",
    "name": "Vibez",
    "tagline": "Every room is a photobooth",
    "description": "QR codes around the venue open a night-flash camera; every photo lands on a live feed and a TV wall, tagged to the right event.",
    "url": "https://vibez.axxes.club",
    "color": "#ff4d8d",
    "category": "Events",
    "status": "beta",
    "sso": true
  },
  {
    "key": "qortr",
    "name": "Rooms",
    "tagline": "The room, booked and paid",
    "description": "Book rooms and venues with interactive floor maps and flexible pricing, so the calendar and the till agree.",
    "url": "https://qortr.axxes.club",
    "color": "#22d3ee",
    "category": "Events",
    "status": "beta",
    "sso": true
  },
  {
    "key": "manifest",
    "name": "Manifest",
    "tagline": "Every number explains itself",
    "description": "Purchasing, fulfilment, transfers and quality on one honest ledger. Immovable stock moves, mistakes reversed rather than edited, and a cost layer that can be read line by line.",
    "url": "https://manifest.axxes.club",
    "color": "#c8ff3d",
    "category": "Commerce",
    "status": "beta",
    "sso": true
  },
  {
    "key": "office",
    "name": "AXXES Office",
    "tagline": "Documents, spreadsheets and decks, in your workspace.",
    "description": "An office suite from AXXES: Quill for documents, Tally for spreadsheets, Stage for presentations. Files live in workspace folders, open in place from AXXES Folders, and are available to every member.",
    "url": "https://quill.axxes.club",
    "color": "#5b8cff",
    "category": "Work",
    "status": "beta",
    "sso": true
  },
  {
    "key": "krates",
    "name": "Krates",
    "tagline": "The straightforward stock list",
    "description": "The plain track: products, variants and stock levels across locations. Signs in separately for now. PENDING MERGE into Stock — see AXXES-BRAND.md; the key must not change either way.",
    "url": "https://kr8s.axxes.club",
    "color": "#f59e0b",
    "category": "Commerce",
    "status": "live",
    "sso": false
  },
  {
    "key": "tollbooth",
    "name": "Tollbooth",
    "tagline": "Paid, and paid out",
    "description": "Hosted checkout, payouts to your bank, and one reconciliation of what was charged against what actually landed.",
    "url": "https://tollbooth.axxes.club",
    "color": "#a78bfa",
    "category": "Commerce",
    "status": "beta",
    "sso": true
  },
  {
    "key": "api",
    "name": "AXXES for Builders",
    "tagline": "Put your event on AXXES",
    "description": "Events, ticket types, orders and check-ins as an API, plus webhooks. Built for teams shipping their own product on top of ours.",
    "url": "https://api.axxes.club",
    "color": "#94a3b8",
    "category": "Developers",
    "status": "live",
    "sso": false
  },
  {
    "key": "developer",
    "name": "AXXES Developers",
    "tagline": "Build against the whole suite",
    "description": "The API reference, app and key registration, integrations and webhooks, your usage and plan, and copy-paste prompts for building on AXXES.",
    "url": "https://developer.axxes.club",
    "color": "#22d3ee",
    "category": "Developers",
    "status": "beta",
    "sso": true
  },
  {
    "key": "keel",
    "name": "Keel",
    "tagline": "Every change explains itself",
    "description": "Source control for people who did not choose source control. Checkpoints in plain language, a timeline you can scrub, and an undo that cannot lose your work — tied to the AXXES records a change actually affects, so you can always answer what was live when the numbers stopped adding up.",
    "url": "https://keel.axxes.club",
    "color": "#d8a657",
    "category": "Developers",
    "status": "beta",
    "sso": true
  },
  {
    "key": "binnacle",
    "name": "Binnacle",
    "tagline": "Every ticket explains itself",
    "description": "Support tickets with web intake, threaded replies, internal notes, SLA tracking, reports, and a signed customer view.",
    "url": "https://binnacle.axxes.club",
    "color": "#3ddc97",
    "category": "Support",
    "status": "beta",
    "sso": true
  }
];

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
 * `surface_in_members` is deliberately NOT filtered here. That column answers
 * "should the suite sell this?", which is a different question from "does AXXES
 * offer this?". Hiding a product from the public page because a sales decision
 * moved would make this page wrong rather than tidy.
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

    if (!rows.length) return FALLBACK_PRODUCTS;

    return rows.map((r) => ({
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
    }));
  } catch (err) {
    // Never take the public product page down over a query. Log it so it is
    // visible, and show the last-known-good list.
    console.error("[products] falling back to the hardcoded catalog:", err);
    return FALLBACK_PRODUCTS;
  }
}

/** Categories, ordered, with only the ones that actually have products in them. */
export async function getCategories(products: Product[]) {
  const used = new Set(products.map((p) => p.category));
  return CATEGORIES.filter((c) => used.has(c.key));
}
