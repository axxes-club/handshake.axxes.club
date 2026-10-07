import test from 'node:test'
import assert from 'node:assert/strict'
import {oidcClients} from '../src/lib/oidc'
test('Cloud registration is secret-gated and permits only its exact HTTPS callback',()=>{
 const saved=process.env.CLOUD_OIDC_CLIENT_SECRET
 try{
  delete process.env.CLOUD_OIDC_CLIENT_SECRET
  assert.equal(oidcClients().find(c=>c.clientId==='cloud'),undefined)
  process.env.CLOUD_OIDC_CLIENT_SECRET='fixture-cloud-secret-at-least-32-characters'
  const c=oidcClients().find(c=>c.clientId==='cloud')
  assert.ok(c);assert.deepEqual(c.redirectUrls,['https://cloud.axxes.app/api/cloud/auth/callback']);assert.equal(c.type,'web');assert.equal(c.skipConsent,true)
 }finally{if(saved===undefined)delete process.env.CLOUD_OIDC_CLIENT_SECRET;else process.env.CLOUD_OIDC_CLIENT_SECRET=saved}
})
