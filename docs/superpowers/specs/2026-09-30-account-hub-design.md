# Handshake account hub

Status: design for review. The workspace-first overview and management-link approach was approved in conversation on 2026-09-30. This document makes its data coverage and implementation boundaries explicit.

## Outcome

A signed-in user can answer: what do I have across AXXES, which workspace does it belong to, where can I manage it, and who has access to my account? Handshake becomes the account hub, while app-specific records continue to be edited in their owning apps.

Success means real, permission-filtered information rather than another product directory. Preserve the repaired Manifest naming, live catalog, and shared sign-in.

## Experience

The account home opens to an overview. Desktop has a compact left navigation; mobile has the same labeled navigation with a workspace selector above the content. Preserve Handshake's dark palette and lime accent. Favor readable rows, generous spacing, obvious actions, keyboard focus, and usable narrow screens.

Navigation:

- Overview: account summary, workspace memberships and roles, apps with confirmed data or connections, and links to continue working.
- Your data: app-by-app summaries and recent records for the selected workspace, with search and links to the owning app. Personal resources sit in a separate Personal view.
- Workspaces: active memberships, workspace names, roles, primary-workspace indication, and verified entry links.
- Connections: identity providers and OIDC authorizations belonging to this user, with scopes and connection date where available.
- Profile and security: display name, email and verification state, account creation date, password change, active devices, and session revocation.

Example layout:

```text
Handshake                   Workspace: [My business v]
Overview       Your AXXES account
Your data      Profile | Workspaces | Connected apps | Devices
Workspaces
Connections    Continue working
Profile        App          Your accessible data     Open app
Security       Manifest     Inventory summary        Manage inventory
               Lanes        Boards and tasks         Open boards
               Folders      Files and storage        Open library

               Workspace and plan
               Membership role | Plan status | Manage workspace

               Explore other AXXES apps
```

Overview numbers describe their units explicitly. A connected-app count is not the catalog size. Avoid a global record total: a file attached in several apps is still one file, and mixing tickets, tasks, products and bytes is misleading.

Every catalog product remains discoverable, including products with no summary integration. The primary Your apps list includes only apps supported by confirmed access/usage/connection signals. The remaining catalog lives under Explore AXXES. Unknown usage is never presented as zero records or “you do not use this app.”

## Scope and data sources

The hub is one read-only aggregation subsystem plus existing account controls. Shared account information is queried in Handshake; domain records are summarized by the owning app. This avoids maintaining a second implementation of private-board, case-grant, conversation-participant or file-access rules.

| Area | Source | User-visible information |
| --- | --- | --- |
| Profile | Auth session and `user` | Name, email, verification state, joined date |
| Workspaces | `tenant_memberships` joined to `tenants` | Active memberships, roles, primary flag |
| App availability | `axxes_product`, `tenant_modules`, owning-app summary | Catalog, explicit enabled state and actual accessible resources; module keys need an explicit mapping |
| Billing | `subscriptions` and members billing policy | Plan name, status, renewal/end date and management link for authorized users |
| Identity connections | `account` | Provider name and linked date; never tokens, password hashes or raw provider account IDs |
| OIDC connections | `oauth_consent`, `oauth_access_token`, trusted client registry | Client name, granted scopes and authorization state; never credential values |
| Files and app records | Owning-app summary endpoint | Accessible counts, useful recent records, resource-specific actions |
| Devices | Better Auth session API | Browser/device, last activity where available, current device, revocation |

Shared-database schema inspection confirmed memberships, modules, subscriptions and auth tables. Production `assets` currently lacks the newer ownership/grant fields being developed in sibling repositories; the hub must not infer personal ownership from `tenant_id` or assume those changes are deployed.

Coverage uses the current catalog, not a new hardcoded marketing list: Suite, Lanes, Folders, Nexus, Pulse, Vitrine, Matter, Relay, afters, Vibez, Rooms/Qortr, Manifest, Office, Krates, Tollbooth, API, Developers, Keel and Binnacle. New catalog entries appear automatically with an honest summary-availability state.

## App summary contract

Each integrated owning app exposes a versioned read-only summary endpoint. It authenticates the actual user, validates a requested workspace against active membership, and reuses its own resource permissions. Handshake cannot supply an authoritative `userId` or role.

The normalized response contains:

- Version, catalog product key, workspace ID or explicit Personal scope, and observation time.
- Status: ready, empty, unavailable, unsupported, or access denied.
- Metrics with label, numeric value and unit; metrics are optional.
- At most five accessible recent items with a stable resource ID, title, type, update time and validated management URL.
- A validated app entry URL and optional supported management actions.

Ready and empty require a successful authorized lookup. Access denied reveals no resource existence, counts or titles. Unavailable and unsupported omit metrics and offer a safe entry link. “Summary unavailable — open the app to view your data” is the fallback, never invented numbers.

Initial adapters target workspace-backed apps with existing permission code: members, Folders, Manifest, Lanes, Nexus, Matter, Relay, Office, Binnacle, Keel, Pulse and Vibez. Krates, Vitrine, Qortr, Tollbooth and developer products receive adapters only after their identity, permissions and source database are verified. External-domain afters uses its existing AXXES OIDC identity linkage; email matching must not be used to merge accounts. Coverage indicators make these differences visible. This release is not represented as a complete inventory of external-system data until those adapters pass their integration checks.

AXXES-subdomain endpoints receive only the minimum session credential required for authentication, server-to-server. No browser response contains credential values. Endpoints are configured in a reviewed registry with fixed HTTPS origins; a catalog URL is not an arbitrary fetch target. External domains never receive the AXXES cookie. Their summaries require a suitable existing authorization or a separately reviewed, audience-bound integration.

Each app request has a bounded timeout and bounded payload. Fetch in parallel after membership validation, isolate failures, and render account controls even if an app is unavailable. Private responses use `Cache-Control: private, no-store`; no shared or cross-user cache.

## Authorization and workspace navigation

Workspace IDs in query strings and cookies are untrusted selections. Every page, summary and account action verifies the session and live membership. Exclude deleted memberships and workspaces. Record-level grants can narrow workspace access. Superadmin status does not silently broaden this personal account view to every customer's data.

For billing, reuse members' actual billing policy rather than inventing an owner/admin rule. Users without billing access receive no restricted details or management action.

App entry links carry the selected workspace only where the destination implements and validates that contract. An unrecognized `tenant` query parameter is not proof of workspace switching. For apps without that support, link to their verified entry route and explicitly instruct the user to choose the workspace there. Do not overwrite host-specific tenant cookies from Handshake.

Connected identity providers are listed separately from AXXES apps using the shared session. Revoking an OIDC authorization does not promise to sign the user out of a shared-cookie app. For this release, connection management is informational unless an existing supported revoke endpoint is verified; device revocation remains available through Better Auth. Do not allow removal of the only working sign-in method.

## Account controls

Retain name and password updates, improve pending/success/error handling, and add explicit error reporting to session revocation. Display profile details alongside editable fields. Keep current-device status clear and offer sign-out of other devices. Mutation handlers reauthenticate and validate ownership on the server.

Users may download a clearly labeled Account overview JSON containing their profile, memberships, connection metadata and available summaries. It excludes secrets and is explicitly an overview, not a full export of every app's records. Offer app export links only when those exports exist and are authorized. No account deletion, workspace deletion or bulk app-record mutation is introduced.

## Implementation boundaries

- Handshake: authenticated account navigation, shared account loader, summary orchestration, app integration registry, account overview download, and existing account controls.
- Owning apps: read-only summary adapters that reuse their permission functions, plus workspace entry support where needed.
- Members owns shared schemas. Handshake adds mappings for existing columns; it does not run migrations or modify billing plans.
- Preserve prior uncommitted repairs and unrelated concurrent work in sibling repositories. Isolate new implementation work and review changes per repository.

## Acceptance and verification

1. Signed-out users cannot retrieve the account overview, summaries or download.
2. Two users in different workspaces cannot read each other's counts, recent titles, billing or connections, including through forged query parameters.
3. A member of two workspaces sees correct summaries after switching; revoked/deleted membership immediately removes access.
4. Private-board, file-grant, case-grant and conversation-participant tests exercise the owning app's real access rules.
5. Successful empty responses show zero; timeouts, missing integrations and denied requests never show zero or disclose hidden resources.
6. Current catalog and Manifest checks continue to pass. Your apps is distinct from Explore AXXES.
7. Profile/password updates and device revocation show accurate success and failure states; downloads contain no credentials.
8. Desktop and mobile navigation work by keyboard, with labeled controls, visible focus and adequate contrast.
9. Run relevant unit/integration checks, lint, type checking and production builds; verify shared SSO and representative authenticated journeys after deployment. Use temporary fixtures and remove them.
10. The release report names which adapters were verified and which still show unavailable/unsupported, rather than claiming complete coverage.

## Review result

The design keeps one owner for each permission rule, explicitly distinguishes app discovery from personal usage, and distinguishes empty data from incomplete coverage. The initial hub and its adapter contract form one implementation plan; remaining external-source adapters can be delivered individually without restructuring the hub.
