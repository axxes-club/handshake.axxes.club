import test from 'node:test';
import assert from 'node:assert/strict';
import {oidcClients} from '../src/lib/oidc';
test('Folders receives only its exact HTTPS callback and is omitted without a secret',()=>{
 const previous=process.env.FOLDERS_OIDC_CLIENT_SECRET;
 try{
  delete process.env.FOLDERS_OIDC_CLIENT_SECRET;assert.equal(oidcClients().find(c=>c.clientId==='folders'),undefined);
  process.env.FOLDERS_OIDC_CLIENT_SECRET='synthetic-folders-client-secret-32-characters';
  const client=oidcClients().find(c=>c.clientId==='folders');assert.ok(client);assert.deepEqual(client.redirectUrls,['https://folders.axxes.app/api/auth/axxes/callback']);assert.equal(client.type,'web');
 }finally{if(previous===undefined)delete process.env.FOLDERS_OIDC_CLIENT_SECRET;else process.env.FOLDERS_OIDC_CLIENT_SECRET=previous;}
});
