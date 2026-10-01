import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Shared AXXES platform tables (schema owned by the members portal — mapped here, never migrated)

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isSuperadmin: boolean("is_superadmin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull(),
  isActive: boolean("is_active").notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const tenantMemberships = pgTable("tenant_memberships", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── OIDC provider (Handshake is the identity provider for the AXXES suite) ──
//
// These three tables back the oidcProvider plugin: the registered client
// (qortr), the tokens it holds, and the consent someone has already given.
// Same shape better-auth expects; the drizzle adapter maps them.

export const oauthApplication = pgTable("oauth_application", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  metadata: text("metadata"),
  clientId: text("client_id").notNull().unique(),
  clientSecret: text("client_secret"),
  redirectUrls: text("redirect_urls").notNull(),
  type: text("type").notNull(),
  disabled: boolean("disabled").notNull().default(false),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const oauthAccessToken = pgTable("oauth_access_token", {
  id: text("id").primaryKey(),
  accessToken: text("access_token").notNull().unique(),
  refreshToken: text("refresh_token").notNull().unique(),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }).notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }).notNull(),
  clientId: text("client_id").notNull(),
  userId: text("user_id"),
  scopes: text("scopes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const oauthConsent = pgTable("oauth_consent", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  userId: text("user_id").notNull(),
  scopes: text("scopes"),
  consentGiven: boolean("consent_given").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Additive source-owned schema required only when workspace OIDC is enabled.
export const jwks = pgTable('jwks', {
  id: text('id').primaryKey(), publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(), createdAt: timestamp('created_at',{withTimezone:true}).notNull(),
  expiresAt: timestamp('expires_at',{withTimezone:true}),
});

/**
 * The shared product catalog, owned by the members portal.
 *
 * This table is the reason the public product page can never drift from what
 * the suite actually offers. It used to be a hand-maintained array in
 * products.ts, which meant every new app needed a code change in two
 * repositories — and a product added to the suite was invisible here until
 * somebody remembered. One row, read from one place, is the whole fix.
 */
export const axxesProduct = pgTable("axxes_product", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("beta"),
  sso: boolean("sso").notNull().default(false),
  icon: text("icon"),
  membersPath: text("members_path"),
  surfaceInMembers: boolean("surface_in_members").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
