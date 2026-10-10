import test from 'node:test';
import assert from 'node:assert/strict';
import {oidcClients} from '../src/lib/oidc';
test('Project ORC receives only its exact HTTPS callback and is omitted without a secret',()=>{
 const previous=process.env.PROJECT_ORC_OIDC_CLIENT_SECRET;
 try{
  delete process.env.PROJECT_ORC_OIDC_CLIENT_SECRET;assert.equal(oidcClients().find(c=>c.clientId==='project-orc'),undefined);
  process.env.PROJECT_ORC_OIDC_CLIENT_SECRET='synthetic-project-orc-client-secret-32-chars';
  const client=oidcClients().find(c=>c.clientId==='project-orc');assert.ok(client);assert.deepEqual(client.redirectUrls,['https://app.vitrine.axxes.app/api/auth/callback/axxes']);assert.equal(client.type,'web');assert.equal(client.skipConsent,true);
 }finally{if(previous===undefined)delete process.env.PROJECT_ORC_OIDC_CLIENT_SECRET;else process.env.PROJECT_ORC_OIDC_CLIENT_SECRET=previous;}
});
