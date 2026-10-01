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

## Production checks

- `npm run check:catalog` checks that sign-in and sign-up show the newer apps and Manifest, and that the product directory includes Support. Pass a base URL to `node scripts/check-handshake.mjs <url>` to check another deployment.
- `npm run check:sso` checks the shared session against each AXXES app. It uses `DATABASE_URL` and `BETTER_AUTH_SECRET` from `.env.local`, creates a temporary verification account and five-minute session, then removes both in `finally`. Use an environment that matches the deployed apps. It never prints credentials or session tokens.

Production deploys must build against the real Vercel environment. Do not use pulled `[SENSITIVE]` placeholders as configuration values. Relay consumes `BETTER_AUTH_BASE_URL` (rather than `BETTER_AUTH_URL`) and must share Handshake's `BETTER_AUTH_SECRET` and `AUTH_COOKIE_DOMAIN=axxes.club`.

## AXXES Work OIDC

Set `OFFICE_OIDC_CLIENT_SECRET` to the same provisioned value as Office's
`AXXES_OIDC_CLIENT_SECRET`; Office uses client ID `office`. Exact callbacks are
`https://axxes.work/api/auth/axxes/callback` and
`http://localhost:3111/api/auth/axxes/callback`. Work uses a host-local session,
not the axxes.club cookie. Client registration is inactive until the secret is set.
