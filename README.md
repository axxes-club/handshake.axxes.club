# Handshake — AXXES Account

Central sign-in for every AXXES product (handshake.axxes.club).

- Better Auth on the shared AXXES database (`user`, `session`, `account`, `verification` — schema owned by the members portal, never migrated from here).
- In production `AUTH_COOKIE_DOMAIN=axxes.club`, so the session cookie is shared by every `*.axxes.club` app. Each app must use the same `BETTER_AUTH_SECRET` and better-auth version (1.4.19).
- Sign-up is invite-only and runs server-side (`src/app/actions.ts`); the public `/api/auth/sign-up/email` route is disabled.
- Apps send signed-out users to `/sign-in?redirect=<url>` and sign out via `/sign-out?redirect=<url>`. Redirects are limited to the AXXES parent domain.

## Env

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Shared AXXES Postgres |
| `BETTER_AUTH_SECRET` | Same value in every AXXES app |
| `BETTER_AUTH_URL` | `https://handshake.axxes.club` |
| `AUTH_COOKIE_DOMAIN` | `axxes.club` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL` | Password reset emails |
