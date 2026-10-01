-- Workspace-only OIDC storage; legacy OIDC and global JWKS remain unchanged.
BEGIN;
CREATE TABLE IF NOT EXISTS workspace_oidc_codes (
 code_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
 client_id text NOT NULL, redirect_uri text NOT NULL, challenge text NOT NULL,
 scopes text NOT NULL, nonce text NOT NULL, auth_time timestamptz NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_oidc_token_metadata (
 token_id text PRIMARY KEY REFERENCES oauth_access_token(id) ON DELETE CASCADE,
 nonce text NOT NULL, auth_time timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_oidc_refresh_history (
 token_hash text PRIMARY KEY, token_id text NOT NULL, client_id text NOT NULL,
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS workspace_oidc_keys (
 id text PRIMARY KEY, private_jwk jsonb NOT NULL, public_jwk jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS workspace_oidc_codes_expiry ON workspace_oidc_codes(expires_at);
CREATE INDEX IF NOT EXISTS workspace_oidc_refresh_expiry ON workspace_oidc_refresh_history(expires_at);
COMMIT;
