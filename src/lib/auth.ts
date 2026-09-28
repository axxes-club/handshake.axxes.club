import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./schema";
import { sendPasswordResetEmail } from "./email";
import { oidcProvider } from "better-auth/plugins";
import { ALLOWED_SCOPES, oidcClients } from "./oidc";

// Set in production so every *.axxes.club app shares one signed-in session
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const parent = (cookieDomain || "axxes.club").replace(/^\./, "");
const allowHttp = process.env.NODE_ENV !== "production" || process.env.ALLOW_HTTP_REDIRECTS === "true";
const trustedOrigins = [`https://${parent}`, `https://*.${parent}`, ...(allowHttp ? [`http://*.${parent}:*`] : [])];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      oauthApplication: schema.oauthApplication,
      oauthAccessToken: schema.oauthAccessToken,
      oauthConsent: schema.oauthConsent,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  // Sign-up only goes through our server action, which enforces invite codes
  disabledPaths: ["/sign-up/email"],
  trustedOrigins,
  advanced: cookieDomain ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } } : undefined,
  plugins: [
    nextCookies(),
    // Handshake is the identity provider for the suite. A signed-in AXXES
    // account can enter any registered product without a second sign-up.
    // Clients live in code (src/lib/oidc.ts), not in a public registration
    // endpoint, so adding a product is a reviewed change.
    oidcProvider({
      loginPage: "/sign-in",
      metadata: {
        issuer: process.env.BETTER_AUTH_URL,
      },
      scopes: ALLOWED_SCOPES,
      defaultScope: "openid email profile",
      // PKCE on. The authorization code is bound to the client that asked
      // for it, so an intercepted code is useless on its own.
      requirePKCE: true,
      allowDynamicClientRegistration: false,
      trustedClients: oidcClients(),
      // Extra claims a product can read, so RBAC there doesn't need a
      // second round trip back here.
      // Guarded on purpose. A throw here fails the whole /userinfo response,
      // which looks to the client exactly like "sign-in is broken" rather than
      // "a decorative claim failed" — so this must never be able to throw.
      getAdditionalUserInfoClaim: async (user) => ({
        axxes_role: user?.isSuperadmin ? "superadmin" : "member",
      }),
    }),
  ],
});
