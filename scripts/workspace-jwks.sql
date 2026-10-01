-- Explicit additive prerequisite for WORKSPACE_OIDC_ENABLED=true.
CREATE TABLE IF NOT EXISTS jwks (
  id text PRIMARY KEY,
  public_key text NOT NULL,
  private_key text NOT NULL,
  created_at timestamptz NOT NULL,
  expires_at timestamptz
);
