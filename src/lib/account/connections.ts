import type { ConnectionInfo } from "./types";
type Identity = { id: string; providerId: string; createdAt: Date; [key: string]: unknown };
type Consent = { clientId: string; scopes: string | null; consentGiven: boolean; createdAt: Date; [key: string]: unknown };
type Token = { clientId: string; createdAt: Date; accessTokenExpiresAt: Date; refreshTokenExpiresAt: Date; [key: string]: unknown };
const products: Record<string, string> = { qortr: "Rooms", vitrine: "Vitrine", afters: "afters.am" };
export function connectionMetadata(identities: Identity[], consents: Consent[], tokens: Token[], names: Record<string, string> = {}): ConnectionInfo[] {
  const result: ConnectionInfo[] = [];
  const providers = new Set<string>();
  for (const a of identities) {
    if (providers.has(a.providerId)) continue;
    providers.add(a.providerId);
    result.push({ id: a.id, kind: "identity", name: a.providerId === "credential" ? "Email and password" : a.providerId, connectedAt: a.createdAt.toISOString(), scopes: [], state: "linked" });
  }
  const clients = new Set([...consents.filter(c => c.consentGiven).map(c => c.clientId), ...tokens.map(t => t.clientId)]);
  for (const id of clients) {
    const consent = consents.find(c => c.clientId === id && c.consentGiven);
    const allTokens = tokens.filter(t => t.clientId === id);
    const active = allTokens.some(t => t.accessTokenExpiresAt > new Date() || t.refreshTokenExpiresAt > new Date());
    const connected = consent?.createdAt ?? allTokens.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]?.createdAt;
    result.push({ id, kind: "oidc", name: names[id] ?? products[id] ?? "Connected application", productKey: products[id] ? id : undefined, connectedAt: connected?.toISOString() ?? null, scopes: (consent?.scopes ?? "openid email profile").split(/[\s,]+/).filter(Boolean), state: active ? "active" : "expired" });
  }
  return result;
}
