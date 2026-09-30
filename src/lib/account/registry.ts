import type { AppIntegration } from "./types";
const hosts: Record<string, string> = { suite: "members", folders: "folders", manifest: "manifest", lanes: "lanes", nexus: "nexus", matter: "matters", relay: "relay", office: "quill", binnacle: "binnacle", keel: "keel", pulse: "pulse", vibez: "vibez" };
export function getIntegration(productKey: string): AppIntegration | null {
  const host = hosts[productKey];
  if (!host) return null;
  const origin = `https://${host}.axxes.club`;
  return { productKey, summaryUrl: `${origin}/api/handshake/summary`, allowedOrigins: [origin], supportsPersonal: productKey === "folders", workspaceEntry: "choose-in-app" };
}
