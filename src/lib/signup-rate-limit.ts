/** A bounded per-instance throttle supplements the edge limit for Server Actions. */
const attempts = new Map<string, { count: number; expires: number }>();
export function allowSignupAttempt(key: string, now = Date.now()): boolean {
  for (const [candidate, entry] of attempts) if (entry.expires <= now) attempts.delete(candidate);
  const entry = attempts.get(key);
  if (entry) { entry.count++; return entry.count <= 10; }
  if (attempts.size >= 10_000) return false;
  attempts.set(key, { count: 1, expires: now + 60_000 });
  return true;
}
/** Google's load balancer appends the real client and forwarding-rule IP. */
export function signupClientAddress(headers: Headers): string {
  const chain = (headers.get('x-forwarded-for') ?? '').split(',').map(part => part.trim()).filter(Boolean);
  return chain.length >= 2 ? chain[chain.length - 2] : chain[0] ?? 'unknown';
}
