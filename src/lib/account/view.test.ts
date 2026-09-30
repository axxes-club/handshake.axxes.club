import {test} from 'node:test';import assert from 'node:assert/strict';import {filterData,confirmedApps} from './view';
const base={productKey:'manifest',status:'ready',metrics:[],recent:[{id:'1',title:'Allowed item',type:'product',updatedAt:'2026-01-01',url:'https://manifest.axxes.club'}]};
test('app discovery is not usage evidence',()=>{assert.equal(confirmedApps([{...base,status:'unsupported'},{...base,productKey:'relay',status:'empty'}] as never,[]).length,1)});
test('search only filters authorized supplied titles',()=>{assert.equal(filterData([base] as never,'ALLOWED').length,1);assert.equal(filterData([base] as never,'secret').length,0)});
