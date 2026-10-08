import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirect } from "../src/lib/redirect";

test("production redirects reject browser origin escapes and control characters", () => {
  const previous = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  try {
    for (const target of ["/\\evil.example/after-login", "//evil.example", "/\n/evil.example", "/dashboard\u0000", "https://pulse.axxes.club\\@evil.example/"]) {
      assert.equal(safeRedirect(target, "/safe"), "/safe", target);
    }
    assert.equal(safeRedirect("/one/../dashboard?site=1#report"), "/dashboard?site=1#report");
    assert.equal(new URL(safeRedirect("/dashboard?site=1"), "https://account.axxes.club").origin, "https://account.axxes.club");
    assert.equal(safeRedirect("https://pulse.axxes.club/sign-in?returnTo=%2Fdashboard%2Freports"), "https://pulse.axxes.club/sign-in?returnTo=%2Fdashboard%2Freports");
    assert.equal(safeRedirect("https://axxes.club/"), "https://axxes.club/");
    assert.equal(safeRedirect("https://axxes.club.evil.example/"), "/");
    assert.equal(safeRedirect("https://pulse.axxes.app/"), "/");
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previous });
  }
});

test("HTTP exceptions do not authorize other URL schemes", () => {
  const previous = process.env.ALLOW_HTTP_REDIRECTS;
  process.env.ALLOW_HTTP_REDIRECTS = "true";
  try {
    assert.equal(safeRedirect("http://pulse.axxes.club/dashboard"), "http://pulse.axxes.club/dashboard");
    assert.equal(safeRedirect("ftp://pulse.axxes.club/dashboard"), "/");
  } finally {
    if (previous === undefined) delete process.env.ALLOW_HTTP_REDIRECTS;
    else process.env.ALLOW_HTTP_REDIRECTS = previous;
  }
});

test("explicit Pulse destination wins over an abandoned OIDC login response", async () => {
  const { signInReturn } = await import("../src/lib/signup-policy");
  const stale = { redirect: true, url: "https://unrelated.axxes.app/oauth/callback?code=old" };
  const pulse = "https://pulse.axxes.club/sign-in?returnTo=%2Fdashboard%2Freports";
  assert.equal(signInReturn(pulse, stale), pulse);
  assert.equal(signInReturn("/", stale), stale.url);
  assert.equal(signInReturn("/dashboard", { redirect: false, url: stale.url }), "/dashboard");
});
