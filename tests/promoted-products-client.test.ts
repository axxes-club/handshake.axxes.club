import test from "node:test";
import assert from "node:assert/strict";
import { discoverableProducts, promotedProducts, FALLBACK_PRODUCTS } from "../src/lib/products-catalog";

const row = (key: string, name: string, url: string, status = "live") => ({ key, name, url, status });

test("public pages never show unpromoted or unready products", () => {
  const shown = promotedProducts(discoverableProducts([
    row("lanes", "Lanes", "https://lanes.axxes.app"),
    row("matter", "Matter", "https://matter.axxes.app"),
    row("krates", "Krates", "https://kr8s.axxes.club"),
    row("vitrine", "Vitrine", "https://vitrine.axxes.app"),
    row("keel", "Keel", "https://keel.axxes.club", "soon"),
    row("binnacle", "Binnacle", "https://binnacle.axxes.club", "soon"),
    row("future", "Future", "https://future.axxes.app", "soon"),
  ])).map(p => p.key);
  assert.deepEqual(shown, ["lanes"]);
});

test("owner-set names replace stale catalog names", () => {
  const names = discoverableProducts([
    row("qortr", "Rooms", "https://qortr.app"),
    row("tollbooth", "AXXES Pay", "https://tollbooth.axxes.club"),
    row("api", "AXXES for Builders", "https://api.axxes.club"),
  ]).map(p => p.name);
  assert.deepEqual(names, ["Qortr", "Tollbooth", "AXXES API"]);
});

test("the fallback catalog follows the same rules", () => {
  const keys = promotedProducts(discoverableProducts(FALLBACK_PRODUCTS)).map(p => p.key);
  for (const hidden of ["matter", "krates", "vitrine", "keel", "binnacle"]) assert.ok(!keys.includes(hidden), hidden);
});
