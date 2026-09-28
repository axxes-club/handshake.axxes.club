#!/usr/bin/env bash
# Switches every *.axxes.club app to Handshake sign-in (shared .axxes.club session).
# Run only after handshake.axxes.club resolves (Cloudflare CNAME → cname.vercel-dns.com).
# Everyone signs in again once. Rollback: remove AUTH_COOKIE_DOMAIN + HANDSHAKE_URL and redeploy.
set -euo pipefail
DEV="$HOME/Developer"
HS="https://handshake.axxes.club"

# Resolve through a public resolver so a stale local DNS cache doesn't block the check
ip="$(dig +short @1.1.1.1 handshake.axxes.club | tail -1)"
[ -n "$ip" ] && curl -fsS -o /dev/null --resolve "handshake.axxes.club:443:$ip" "$HS/sign-in" \
  || { echo "✗ $HS isn't reachable yet — add the DNS record first"; exit 1; }

secret_file="$(mktemp)"; chmod 600 "$secret_file"; trap 'rm -f "$secret_file"' EXIT
node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");const m=t.match(/^BETTER_AUTH_SECRET=(.*)$/m)[1];process.stdout.write(m.startsWith("\"")?JSON.parse(m):m)' \
  "$DEV/handshake.axxes.club/.env.local" > "$secret_file"

set_env() { # dir name value [sensitive]
  (cd "$1" && vercel env rm "$2" production --yes >/dev/null 2>&1 || true
   if [ "${4:-}" = sensitive ]; then vercel env add "$2" production --sensitive < "$3" >/dev/null
   else printf '%s' "$3" | vercel env add "$2" production >/dev/null; fi)
}

# project dir | auth URL variable | public URL
while IFS='|' read -r dir urlvar url; do
  echo "→ $dir"
  set_env "$DEV/$dir" BETTER_AUTH_SECRET "$secret_file" sensitive
  set_env "$DEV/$dir" "$urlvar" "$url"
  set_env "$DEV/$dir" AUTH_COOKIE_DOMAIN "axxes.club"
  [ "$dir" = handshake.axxes.club ] || set_env "$DEV/$dir" HANDSHAKE_URL "$HS"
  prod="$(cd "$DEV/$dir" && vercel ls --prod 2>/dev/null | grep -oE 'https://[a-z0-9-]+-personal-e870166f\.vercel\.app' | head -1)"
  (cd "$DEV/$dir" && vercel redeploy "$prod" --target production >/dev/null) && echo "  redeployed"
done <<'APPS'
handshake.axxes.club|BETTER_AUTH_URL|https://handshake.axxes.club
members.axxes.club|BETTER_AUTH_BASE_URL|https://members.axxes.club
dam.axxes.club|BETTER_AUTH_URL|https://folders.axxes.club
pulse.axxes.club|BETTER_AUTH_URL|https://pulse.axxes.club
manifest.axxes.club|BETTER_AUTH_URL|https://manifest.axxes.club
tollbooth.axxes.club|BETTER_AUTH_URL|https://tollbooth.axxes.club
APPS
echo "✓ Handshake is on. Sign in at $HS"
