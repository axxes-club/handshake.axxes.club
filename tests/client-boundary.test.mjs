import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

// A client can import presentation data, but must never reach a database driver,
// even through a dynamic import inside a function it does not call.
test('authentication UI module graph excludes database drivers', () => {
  const seen = new Set();
  const src = resolve('src');
  function walk(file, chain = []) {
    if (seen.has(file)) return;
    seen.add(file);
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)["']([^"']+)["']/g)) {
      const spec = match[1];
      assert.ok(!/^(pg|@neondatabase\/serverless|drizzle-orm\/(node-postgres|neon-http))$/.test(spec), [...chain, file, spec].join(' → '));
      if (!spec.startsWith('.') && !spec.startsWith('@/')) continue;
      const base = spec.startsWith('@/') ? resolve(src, spec.slice(2)) : resolve(dirname(file), spec);
      const child = [base+'.ts', base+'.tsx', resolve(base,'index.ts')].find(existsSync);
      if (child) walk(child,[...chain,file]);
    }
  }
  walk(resolve('src/components/ui.tsx'));
});
