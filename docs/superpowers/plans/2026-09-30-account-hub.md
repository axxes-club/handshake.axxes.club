# Handshake Account Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give users a workspace-first view of their actual AXXES data, connections and account controls, with permission-correct links to manage records in their owning apps.

**Architecture:** Handshake reads shared account metadata and requests normalized summaries from reviewed owning-app endpoints. Each app authenticates the user and resolves the requested workspace explicitly before applying its existing resource permissions. The account shell and controls remain usable when individual summaries fail.

**Tech Stack:** Next.js 16.3.6 App Router, React 19, TypeScript, Drizzle/Neon, Better Auth 1.4.19, Tailwind; `tsx`/Node test runner for new focused tests and Playwright for authenticated browser journeys.

**Spec:** `docs/superpowers/specs/2026-09-30-account-hub-design.md` (approved 2026-09-30).

## Global Constraints

- Preserve the repaired Manifest naming, live catalog, and shared sign-in.
- Preserve Handshake's dark palette and lime accent.
- At most five accessible recent items per app summary.
- Private responses use `Cache-Control: private, no-store`; no shared or cross-user cache.
- Members owns shared schemas. Handshake adds mappings for existing columns; it does not run migrations or modify billing plans.
- No account deletion, workspace deletion or bulk app-record mutation is introduced.
- External domains never receive the AXXES cookie. Never merge identities by email.
- “Summary unavailable — open the app to view your data” is the unavailable-summary copy.
- Preserve prior uncommitted repairs and unrelated concurrent work in sibling repositories.
- Read each changed Next.js package's relevant local `node_modules/next/dist/docs/` before implementation. Read relevant AGENTS.md files in sibling repositories.

## Review Focus

1. An invalid workspace hint must return denial, never silently substitute the primary workspace (Tasks 2–4, 8).
2. An app can return HTTP 200 with HTML, malformed JSON, the wrong workspace or an unsafe URL; reject its summary without losing the account page (Tasks 1, 3).
3. Multiple memberships can have duplicate names or multiple primary flags; use stable IDs and deterministic selection (Tasks 2, 5).
4. A connection using skipped consent may have tokens without a consent row; show active authorization metadata without exposing credentials (Tasks 2, 6).
5. Files may have legacy schemas and apps may lack billing/summary capabilities; show unavailable coverage instead of inferring ownership or inventing zeroes (Tasks 3, 4, 5).

## File Structure and Interfaces

All paths below are relative to the named repository. Preserve existing public auth routes and `/apps`.

Handshake files:

- `src/lib/account/types.ts`: public account DTOs, `AccountScope = { kind: 'personal' } | { kind: 'workspace'; id: string }`, `SummaryStatus = 'ready' | 'empty' | 'unavailable' | 'unsupported' | 'denied'`.
- `src/lib/account/summary-contract.ts`: runtime summary validation; no database dependencies.
- `src/lib/account/registry.ts`: fixed origins and capabilities for integrated products; no arbitrary catalog fetch destinations.
- `src/lib/account/store.ts`: authenticated shared-table reads, with explicit column projections.
- `src/lib/account/scope.ts`: validate membership-backed scope selection.
- `src/lib/account/summaries.ts`: bounded fetch, cookie minimization and failure isolation.
- `src/lib/account/overview.ts`: compose one account view for pages and download.
- `src/lib/account/export.ts`: explicit export projection excluding credentials.
- `src/lib/schema.ts`: map existing membership columns needed by the hub.
- `src/app/(account)/layout.tsx`, `page.tsx`, `data/page.tsx`, `workspaces/page.tsx`, `connections/page.tsx`, `profile/page.tsx`, `security/page.tsx`, `loading.tsx`, `error.tsx`: authenticated account pages; move the existing root `src/app/page.tsx` into this group.
- `src/components/account/{navigation,workspace-selector,app-summary,data-list,coverage,profile-form,security-settings}.tsx`: focused account UI components.
- `src/app/api/account/overview/route.ts`, `src/app/api/account/export/route.ts`: authenticated JSON overview and download.
- `src/lib/account/*.test.ts`, `tests/account-hub.spec.ts`, `tests/fixtures/account-hub.ts`, `playwright.config.ts`: unit, integration and browser coverage.
- `scripts/check-account-hub.mjs`, existing `scripts/check-handshake.mjs`, `scripts/check-sso.mjs`: production smoke checks.

Owning-app files, independently committed in each target repository:

- `src/lib/handshake/{types,context,summary}.ts`: contract DTO, strict authenticated context, domain summary.
- `src/app/api/handshake/summary/route.ts`: `GET /api/handshake/summary?workspace=<uuid|personal>`.
- `src/lib/handshake/summary.test.ts`: app-specific authorization and summary tests.

Public DTO decisions:

- `AppSummary`: `{ version: 1; productKey: string; scope: AccountScope; observedAt: string; status: SummaryStatus; metrics: Array<{label: string; value: number; unit: string}>; recent: Array<{id: string; title: string; type: string; updatedAt: string; url: string}>; entryUrl: string; actions: Array<{label: string; url: string}>; workspaceEntry: 'supported' | 'choose-in-app' }`.
- `AccountOverview`: `{ profile: {name; email; emailVerified; image; joinedAt}; workspaces: Array<{id; name; role; isPrimary}>; scope: AccountScope; apps: AppSummary[]; connections: ConnectionInfo[]; billing: BillingInfo; observedAt: string }`. All dates are ISO strings; null values are explicit.
- `ConnectionInfo`: `{id: string; kind: 'identity' | 'oidc'; name: string; connectedAt: string | null; scopes: string[]; state: 'linked' | 'active' | 'expired'}`. No provider account IDs or credential values.
- `BillingInfo`: `{status: 'available'; planName: string; subscriptionStatus: string; periodEnd: string | null; managementUrl: string | null} | {status: 'unavailable' | 'denied' | 'not-applicable'}`.

## Task 1: Define and validate the summary boundary

**Files:** Handshake `types.ts`, `summary-contract.ts`, `registry.ts`, `summary-contract.test.ts`, `package.json`, lockfile.

**Interfaces:** Produces `validateSummary(input: unknown, expected: {productKey: string; scope: AccountScope; allowedOrigins: string[]}): AppSummary | null` and `getIntegration(productKey: string): AppIntegration | null`. `AppIntegration` has fixed `summaryUrl`, `allowedOrigins`, `supportsPersonal`, and `workspaceEntry`.

- [ ] Write tests rejecting mismatched workspace/product, nonfinite/negative metrics, more than five recent items, invalid timestamps and URLs with foreign origins, credentials or non-HTTPS schemes. Assert valid empty responses retain real zeroes; denied/unavailable responses cannot contain metrics or recent titles. Reject unknown extra secret-bearing properties by returning a projected DTO, not the input object.
- [ ] Add `tsx` as a dev dependency and `test:unit = tsx --test src/lib/account/*.test.ts`; run the tests and observe failure before implementing.
- [ ] Implement the DTOs and validator. Use fixed registry origins; reject redirects and userinfo-bearing URLs. Registry maps `folders` to the verified Folders-serving deployment; verify its production alias before fixing the endpoint origin. Unknown catalog keys return unsupported.
- [ ] Run `npm run test:unit`; require all contract tests passing.
- [ ] Commit only Task 1 files.

## Task 2: Load personal account metadata and validate scopes

**Files:** Handshake `store.ts`, `scope.ts`, `store.test.ts`, `scope.test.ts`, `schema.ts`, `tests/fixtures/account-hub.ts`.

**Interfaces:** Produces `loadAccountMetadata(headers: Headers): Promise<AccountMetadata | null>` and `resolveAccountScope(requested: string | undefined, workspaces: WorkspaceInfo[]): ScopeResolution`. `ScopeResolution` is `{ok: true; scope: AccountScope} | {ok: false; status: 400 | 403}`. `AccountMetadata` contains profile, workspaces and connections only, using the DTOs above.

- [ ] Write tests for signed-out access, forged/deleted memberships, deleted workspaces, duplicate names, duplicate primary flags, empty membership lists and OIDC token-without-consent connections. Assert an explicit foreign workspace is denied; an omitted workspace deterministically selects the earliest active primary membership, then the first stable name/ID order, or Personal.
- [ ] Run tests against isolated two-user/two-workspace fixtures; require the expected failures. Fixtures use `ACCOUNT_TEST_DATABASE_URL`, never default to the production DSN, and clean up in `finally`.
- [ ] Map `is_primary` and `joined_at` in `schema.ts`; implement parameterized, explicitly projected reads. Scope every connection query by the authenticated user. Collapse connections by provider/client; include code-registered OIDC client names without importing secrets into the DTO. Filter revoked/expired tokens when deciding active state. Do not automatically broaden superadmin scope.
- [ ] Run unit/integration checks; assert serialized metadata contains no password, access token, refresh token, session token, client secret or raw provider account ID.
- [ ] Commit only Task 2 files.

## Task 3: Compose a resilient overview and safe download

**Files:** Handshake `summaries.ts`, `overview.ts`, `export.ts`, their tests, overview/export route handlers.

**Interfaces:** Produces `fetchAppSummary(integration: AppIntegration, scope: AccountScope, headers: Headers): Promise<AppSummary>`, `loadAccountOverview(headers: Headers, requestedScope?: string): Promise<OverviewResult>` and `toAccountExport(overview: AccountOverview): AccountExport`. `OverviewResult` is `{ok: true; overview: AccountOverview} | {ok: false; status: 401 | 400 | 403}`.

- [ ] Write tests for delayed apps, 200/HTML, malformed JSON, wrong scopes, redirects, oversized responses and hostile catalog URLs. Assert one failed app leaves successful app summaries and account metadata intact. Assert signed-out and foreign-workspace overview/download requests return 401/403 without private data.
- [ ] Observe failing tests. Fetch tests exercise the real orchestrator against controlled HTTP fixtures, not mocked success objects.
- [ ] Implement parallel fetches with a 4-second deadline per request, 128-KiB maximum response and redirects disabled. Forward only the expected shared signed session cookie to fixed AXXES origins; never forward all cookies or external-domain requests. Project and validate results using Task 1. Responses use private/no-store caching.
- [ ] Implement catalog reconciliation and public export projection. Unsupported apps remain discoverable. Billing defaults to unavailable because members currently has no operative billing-management policy/page; expose financial details only after a verified authorized owning endpoint exists. Preserve explicit module enabled/disabled states through a reviewed mapping; unmapped keys remain unknown.
- [ ] Verify download has JSON attachment headers and excludes security credentials, IPs and unrequested-workspace summaries. Run tests and commit Task 3.

## Task 4: Add owning-app summaries with real permission checks

**Files:** The three owning-app modules, route and test listed above in each row's repository. Modify the referenced existing read helper only when extracting a shared authorized query or explicit context parameter is necessary; no unrelated action refactors.

**Interfaces:** Each app produces `resolveSummaryContext(headers: Headers, workspace: string): Promise<SummaryContextResult>` and `buildSummary(context: SummaryContext): Promise<AppSummary>`. `SummaryContextResult` returns 401/400/403 or an authenticated user plus exactly the requested active membership. Personal scope is supported only when that app has verified personal ownership semantics.

The route must not call an existing context helper that ignores a workspace or silently substitutes primary membership. Strict resolution supplies the owning permission helpers with the selected context. Dates, statuses and projections match Task 1 exactly.

| Repository / key | Existing authorization/read source | Summary content |
| --- | --- | --- |
| `members.axxes.club` / `suite` | `src/lib/auth/tenant-context.ts`, active membership/module reads | Membership and enabled modules; no invented aggregate of all domain records |
| `dam.axxes.club` / `folders` | `src/lib/access.ts`, `asset-policy.ts`, `queries.ts` | Accessible files, bytes, five recent files; Personal only with verified owner filtering |
| `manifest.axxes.club` / `manifest` | `src/lib/permissions.ts`, `queries.ts`, `queries-purchasing.ts` | Permitted products, stock and purchasing summaries; purchasing requires its own view capability |
| `lanes.axxes.club` / `lanes` | `src/lib/lanes/board-access.ts`, `permissions.ts`, `actions.ts` | Accessible boards and tasks; no hidden-board titles or counts |
| `nexus.axxes.club` / `nexus` | `src/lib/nexus/actions.ts` and its read authorization | Accessible spaces/pages and recent pages |
| `matters.axxes.club` / `matter` | `src/lib/matters/access.ts`, `visibleMattersFilter`, document filters | Accessible cases and permitted recent documents; expired/revoked grants excluded |
| `relay.axxes.club` / `relay` | `src/lib/actions/messaging.ts`, conversation participant query | User's conversations, unread count and recent conversations; no message bodies |
| `quill.axxes.club` / `office` | `src/lib/office/access.ts`, `actions.ts` | Accessible documents/sheets/decks and recent records |
| `binnacle.axxes.club` / `binnacle` | `src/lib/desk/actions.ts` and desk's list authorization | Permitted tickets and recent ticket references; exclude confidential message bodies |
| `keel.axxes.club` / `keel` | `src/lib/keel/actions.ts` and project/checkpoint list authorization | Accessible projects/checkpoints and recent checkpoints |
| `pulse.axxes.club` / `pulse` | `src/lib/context.ts`, `actions.ts` | Existing authorized dashboard summary only; no new financial visibility |
| `vibez.axxes.club` / `vibez` | `src/lib/vibez/access.ts`, `actions.ts` | Organizer-accessible events and photo counts; guest identity is not assumed to equal AXXES user |

Repeat this independently testable cycle for **each row**, sequentially unless the user chooses subagent execution:

- [ ] Read the repository's AGENTS.md, schema, actual list authorization and Next.js route-handler guide. Confirm production schema and required app entry paths without logging credentials. If a permission capability or ownership schema is absent, return unavailable for that capability; do not fabricate one.
- [ ] Write a failing endpoint test with two users, two workspaces, deleted membership, malformed UUID, explicit foreign workspace, and a denied resource alongside an allowed resource. Pin app-specific rules: private board, folder grant, expired case grant, conversation participation, organizer status. Assert no hidden titles/counts are serialized.
- [ ] Run the repository's relevant test command and observe failure. Use its existing runner where present; add `tsx --test src/lib/handshake/*.test.ts` only where no runner exists.
- [ ] Implement strict context and the permission-filtered summary. Reuse or extract a context-accepting authorized read query, preserving the app's existing UI caller. No blanket tenant count in place of resource access. Endpoint returns 401 for signed out, 400 for malformed scope, 403 for forbidden workspace, and a validated 200 response for authorized scope.
- [ ] Run app-specific tests, full existing test command, type check and production build. Commit this row's changes and review the diff before the next row. Keep failed/unsupported adapter coverage visible.

The other catalog products retain honest unsupported coverage in this release, as specified. Their future adapters must verify identity/source database first; do not send AXXES cookies to afters or infer external identity by email.

## Task 5: Build account navigation and workspace-first overview

**Files:** Handshake account layout/home/loading/error pages; account navigation, selector, app-summary and coverage components; `tests/account-hub.spec.ts`; Playwright config and dev dependency.

**Interfaces:** Consumes `AccountOverview` from Task 3. Produces `AccountNavigation`, `WorkspaceSelector`, `AppSummaryCard` and `CoverageIndicator` components with explicit typed props. View selection lives in validated `?workspace=<uuid|personal>` query state; changing it never mutates a primary-membership flag or another app's cookies.

- [ ] Write browser tests for an authenticated two-workspace user, duplicate workspace names, no workspace, one summary timeout and keyboard navigation at 390px and 1280px. Assert selecting workspace B shows only B's authorized fixtures; a forged workspace does not render another workspace's titles.
- [ ] Run `npx playwright test tests/account-hub.spec.ts` against the isolated fixture environment and observe failing UI expectations.
- [ ] Move the existing home into `(account)`, add the authenticated responsive shell and six labeled navigation destinations. Render profile/workspace/confirmed-connection counts with explicit units. Your apps requires evidence from ready/empty authorized summaries, confirmed connections or explicitly mapped availability; catalog size is not usage evidence. Keep the full directory under Explore AXXES.
- [ ] Render unavailable coverage with specified copy, retry action and safe app link. Reject invalid selected scope visibly with a link to a valid scope. Preserve account settings even when summaries fail. Display billing unavailable without a misleading management link to a “coming soon” page.
- [ ] Run the browser tests and all Handshake unit tests; commit Task 5.

## Task 6: Add searchable data, workspace and connection views

**Files:** Handshake data/workspaces/connections pages, data-list component and browser tests.

**Interfaces:** Consumes `AccountOverview`; produces client-side `DataList({apps, query})` over already authorized summary records. No search request bypasses the owning-app permission boundary.

- [ ] Write tests for Personal vs workspace data, searching accessible titles, unknown usage, token-without-consent connections and an app with no verified workspace-entry contract. Assert no credential or private counterpart title appears in page HTML.
- [ ] Run and observe failures. Implement app-grouped metrics and up to five recent records per app with management links; label this a summary and link to the owning app for all records. Keep unavailable integrations visible with coverage states.
- [ ] Implement workspace rows keyed by ID, roles and primary indicators. Only append a workspace hint for registry entries whose destination supports and validates it; otherwise show “Choose your workspace in the app.” Identity connections and OIDC authorizations appear separately. No connection revoke/unlink button without a verified existing revoke contract.
- [ ] Run unit and browser checks; commit Task 6.

## Task 7: Improve profile and security management

**Files:** Handshake profile/security pages, profile-form/security-settings components; existing `src/app/account-settings.tsx` split into these focused components; associated browser tests.

**Interfaces:** Profile consumes safe profile DTO; Security reads Better Auth sessions server-side. Prefer session IDs plus server-side actions that reauthenticate/resolve a target session over sending raw revocation tokens to browser props. Produces authenticated actions `revokeAccountSession(sessionId: string)` and `revokeOtherAccountSessions()` returning `{ok: true} | {ok: false; error: string}`.

- [ ] Write tests for save-name failure, password failure/success, expired session, failed device revocation, another user's session ID and current-device labeling. Assert success appears only after successful API response and the overview download contains no credentials.
- [ ] Observe failures. Display profile email, verification state and joined date; retain name/password editing. Implement server-side session ownership validation and readable pending/success/error feedback, clear password fields after success, and refresh current session lists.
- [ ] Add the labeled Account overview download action using Task 3; explain it contains metadata and available summaries. Include app export links only where a reviewed existing export endpoint is authorized.
- [ ] Run security/profile browser and integration tests; commit Task 7.

## Task 8: Verify isolation, coverage and production behavior

**Files:** Handshake `scripts/check-account-hub.mjs`, updated existing smoke scripts, tests and README; coverage report `docs/account-hub-coverage.md`.

**Interfaces:** Produces repeatable test and deployment evidence, plus per-product coverage status. Update the existing signed-in catalog smoke assertion to follow Explore AXXES instead of requiring every product in Your apps.

- [ ] Create a failing integration case for a membership revoked after the account page loads: the next summary/download request must deny access. Include unsupported new catalog key, file legacy schema and wrong-scope adapter response. Run and observe failures, then correct only the owning code if needed.
- [ ] Run all Handshake unit/integration/browser tests, lint, type check and production build. Run changed owning apps' full suites/builds; report pre-existing failures by name. Verify no test imports production secrets into browser bundles.
- [ ] Use the mercelle skill for Linux verification before deployment: `mercelle doctor`, then production builds and authenticated journeys with isolated fixtures. Confirm Linux platform. Do not replace an unavailable VM with an implied Linux pass.
- [ ] Review all changed repository diffs, especially credential forwarding, scope resolution and private projections. Use the selected execution method's required independent review; resolve findings before deployment.
- [ ] Deploy verified owning endpoints first, then Handshake, using real Vercel environment values rather than pulled `[SENSITIVE]` placeholders. Inspect status and aliases before retrying a CLI network error. Preserve working production aliases until each deployment is Ready.
- [ ] Run production catalog and SSO checks and temporary-fixture account-hub smoke checks: selected-workspace correctness, account-control reachability, safe download, no unauthorized data, summary fallback. Clean fixtures in `finally`, never print session credentials.
- [ ] Write the coverage report listing integrated apps, exact verified summaries, unsupported external sources and any unavailable capabilities. Record actual checks and deployment URLs. Commit only the task's files; do not claim a complete external-system inventory.

## Plan Self-Review

- Spec coverage: navigation/UX → Tasks 5–7; source ownership/contract → Tasks 1–4; permissions/workspace navigation → Tasks 2, 4, 6; account controls/export → Tasks 3, 7; failure states/privacy → Tasks 1, 3, 8; deployment and honest coverage → Task 8.
- Review Focus: each of the five cases has explicit tests in its owning tasks.
- Interfaces: `AccountScope`, `AppSummary`, `AccountOverview` and discriminated results are defined before consumers; app endpoints must conform to the runtime contract.
- Scope: one hub plus initial owning-app adapters. External-source expansion and building a billing-management system remain outside this approved release.
- Execution recommendation: Native. Most tasks depend on the same scope/summary contract, so keeping implementation in one session reduces repeated context and interface drift. One independent review of the complete change still precedes deployment.
