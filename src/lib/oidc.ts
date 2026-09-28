/**
 * The OIDC clients allowed to sign in with an AXXES account.
 *
 * Configured here rather than in the database so a client cannot be registered
 * by anyone who can reach the app: adding a product means editing this file
 * and setting the matching secret in the environment. The redirect allowlist is
 * exact — no wildcards — because a redirect_uri is the one thing an attacker
 * controls, and a loose match here is an account-takeover.
 *
 * Shape matches better-auth's `Client`: redirectUrls is a JSON array of strings.
 */

export type OidcClient = {
  clientId: string;
  clientSecret?: string;
  name: string;
  type: "web" | "native" | "user-agent-based" | "public";
  redirectUrls: string[];
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** free-form; better-auth's trusted-client type wants it present */
  metadata: Record<string, unknown> | null;
  /** A first-party product: no consent screen, it just signs you in. */
  skipConsent?: boolean;
};

function client(
  key: string,
  name: string,
  redirectUrls: string[],
  secretEnv: string
): OidcClient | null {
  const clientSecret = process.env[secretEnv];
  if (!clientSecret) return null;
  const now = new Date()
  return {
    clientId: key,
    clientSecret,
    name,
    type: "web",
    redirectUrls,
    disabled: false,
    createdAt: now,
    updatedAt: now,
    metadata: { product: key },
    skipConsent: true,
  };
}

/** qortr answers on three domains; all three are first-party. */
const QORTR_REDIRECTS = [
  "https://qortr.axxes.club/api/auth/callback/axxes",
  "https://qortr.app/api/auth/callback/axxes",
  "https://qortr.com/api/auth/callback/axxes",
  // Local development, so the flow can be exercised before it ships.
  "http://localhost:3000/api/auth/callback/axxes",
];

export function oidcClients(): OidcClient[] {
  const clients = [
    client("qortr", "Qortr", QORTR_REDIRECTS, "QORTR_OIDC_CLIENT_SECRET"),
  ].filter((c): c is OidcClient => c !== null);
  return clients;
}

/** Is this client allowed to ask for these scopes? */
export const ALLOWED_SCOPES = ["openid", "email", "profile"];
