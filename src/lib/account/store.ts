import { and, asc, eq, isNull } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db";
import { account, tenantMemberships, tenants, oauthConsent, oauthAccessToken, oauthApplication } from "../schema";
import { connectionMetadata } from "./connections";
import type { AccountMetadata } from "./types";
export async function loadAccountMetadata(headers: Headers): Promise<AccountMetadata | null> {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const userId = session.user.id;
  const [workspaces, identities, consents, tokens, clients] = await Promise.all([
    db.select({ id: tenants.id, name: tenants.name, role: tenantMemberships.role, isPrimary: tenantMemberships.isPrimary }).from(tenantMemberships).innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId)).where(and(eq(tenantMemberships.userId, userId), isNull(tenantMemberships.deletedAt), isNull(tenants.deletedAt))).orderBy(asc(tenants.name), asc(tenants.id)),
    db.select({ id: account.id, providerId: account.providerId, createdAt: account.createdAt }).from(account).where(eq(account.userId, userId)),
    db.select({ clientId: oauthConsent.clientId, scopes: oauthConsent.scopes, consentGiven: oauthConsent.consentGiven, createdAt: oauthConsent.createdAt }).from(oauthConsent).where(eq(oauthConsent.userId, userId)),
    db.select({ clientId: oauthAccessToken.clientId, createdAt: oauthAccessToken.createdAt, accessTokenExpiresAt: oauthAccessToken.accessTokenExpiresAt, refreshTokenExpiresAt: oauthAccessToken.refreshTokenExpiresAt }).from(oauthAccessToken).where(eq(oauthAccessToken.userId, userId)),
    db.select({ clientId: oauthApplication.clientId, name: oauthApplication.name }).from(oauthApplication),
  ]);
  return { profile: { name: session.user.name, email: session.user.email, emailVerified: session.user.emailVerified, image: session.user.image ?? null, joinedAt: new Date(session.user.createdAt).toISOString() }, workspaces, connections: connectionMetadata(identities, consents, tokens, Object.fromEntries(clients.map(c => [c.clientId, c.name]))) };
}
