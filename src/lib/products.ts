// The AXXES product family, as shown in the account launcher
export type Product = {
  key: string;
  name: string;
  tagline: string;
  url: string;
  color: string;
  status?: "coming-soon";
};

export const PRODUCTS: Product[] = [
  { key: "suite", name: "AXXES Suite", tagline: "Your whole business in one place", url: "https://members.axxes.club", color: "#18181b" },
  { key: "folders", name: "Folders", tagline: "Store, organize and share files", url: "https://dam.axxes.club", color: "#3b82f6" },
  { key: "krates", name: "Krates", tagline: "Inventory and stock across locations", url: "https://kr8s.axxes.club", color: "#f59e0b" },
  { key: "manifest", name: "Manifest", tagline: "Purchasing, fulfilment and transfers", url: "https://manifest.axxes.club", color: "#10b981" },
  { key: "pulse", name: "Pulse", tagline: "Live vital signs for your workspace", url: "https://pulse.axxes.club", color: "#ef4444" },
  { key: "tollbooth", name: "Tollbooth", tagline: "Payments, powered by Stripe", url: "https://tollbooth.axxes.club", color: "#8b5cf6" },
];
