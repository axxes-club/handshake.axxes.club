import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

function catalog() {
 const source=readFileSync('src/lib/products.ts','utf8');
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const module={exports:{}};
 new Function('module','exports','process',compiled)(module,module.exports,{env:{NEXT_PUBLIC_AXXES_ENV:'v2'}});
 return module.exports.FALLBACK_PRODUCTS;
}
test('v2 fallback launches the isolated members portal',()=>{
 const suite=catalog().find(p=>p.key==='suite');
 assert.equal(suite.url,'https://members.v2.axxes.app');
});
test('v2 fallback cannot launch production Krates',()=>{
 const krates=catalog().find(p=>p.key==='krates');
 assert.equal(krates.status,'soon');
 assert.equal(krates.sso,false);
});
