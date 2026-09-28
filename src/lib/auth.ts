import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./schema";
import { sendPasswordResetEmail } from "./email";

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
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
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
  plugins: [nextCookies()],
});
