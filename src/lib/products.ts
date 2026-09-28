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
  { key: "Suite", blurb: "Everything together, in one workspace." },
  { key: "Work", blurb: "Plan, organize and run the business." },
  { key: "Events", blurb: "Everything around a night out." },
  { key: "Commerce", blurb: "Get paid and keep stock moving." },
  { key: "Developers", blurb: "Build on AXXES." },
];

export const PRODUCTS: Product[] = [
  {
    key: "suite", name: "AXXES Suite", category: "Suite", color: "#ededef", url: "https://members.axxes.club", sso: true,
    tagline: "Your whole business in one place",
    description: "CRM, events, orders, website builder, newsletters, messaging and every AXXES app, integrated in one workspace.",
  },
  {
    key: "lanes", name: "Lanes", category: "Work", color: "#60a5fa", url: "https://lanes.axxes.club", sso: true, status: "beta",
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
    tagline: "Events, tickets and afters",
    description: "Discover nights out, sell tickets, run guest lists and door scanning.",
  },
  {
    key: "vibez", name: "Vibez", category: "Events", color: "#ff4d8d", url: "https://vibez.axxes.club", sso: true, status: "beta",
    tagline: "Every room is a photobooth",
    description: "QR codes around the venue open a night-flash camera; every photo lands on a live feed and TV wall.",
  },
  {
    key: "qortr", name: "Qortr", category: "Events", color: "#22d3ee", url: "https://qortr.axxes.club", status: "soon",
    tagline: "Room and space booking",
    description: "Book rooms, desks and venues with interactive floor maps and flexible pricing.",
  },
  {
    key: "tollbooth", name: "Tollbooth", category: "Commerce", color: "#a78bfa", url: "https://tollbooth.axxes.club", sso: true, status: "beta",
    tagline: "Payments, powered by Stripe",
    description: "Hosted checkout, payouts to your bank and one API for every app you run.",
  },
  {
    key: "krates", name: "Krates", category: "Commerce", color: "#f59e0b", url: "https://kr8s.axxes.club", status: "live",
    tagline: "Inventory and stock",
    description: "Track products across locations, suppliers and orders. Signs in separately for now.",
  },
  {
    key: "manifest", name: "Manifest", category: "Commerce", color: "#c8ff3d", url: "https://manifest.axxes.club", sso: true, status: "beta",
    tagline: "Inventory operations",
    description: "Purchasing, fulfilment, transfers and quality, all in one ledger.",
  },
  {
    key: "api", name: "AXXES API", category: "Developers", color: "#94a3b8", url: "https://api.axxes.club", status: "live",
    tagline: "The ticketing API",
    description: "API-first event ticketing: events, ticket types, orders and check-ins for your own apps.",
  },
];
