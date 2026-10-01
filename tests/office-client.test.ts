import {test} from 'node:test'
import assert from 'node:assert/strict'
import {oidcClients} from '../src/lib/oidc'
test('Office registration binds its exact Work callback and leaves other clients intact',()=>{
 const keys=['OFFICE_OIDC_CLIENT_SECRET','QORTR_OIDC_CLIENT_SECRET','VITRINE_OIDC_CLIENT_SECRET','AFTERS_OIDC_CLIENT_SECRET']
 const saved=keys.map(k=>process.env[k])
 try{
  for(const k of keys)process.env[k]='synthetic-'+k
  const clients=oidcClients();const office=clients.find(c=>c.clientId==='office')
  assert.ok(office,'Office client must be registered')
  assert.deepEqual(office.redirectUrls,['https://axxes.work/api/auth/axxes/callback','http://localhost:3111/api/auth/axxes/callback'])
  assert.equal(office.clientSecret,'synthetic-OFFICE_OIDC_CLIENT_SECRET')
  assert.deepEqual(clients.filter(c=>c.clientId!=='office').map(c=>c.clientId),['qortr','vitrine','afters'])
  delete process.env.OFFICE_OIDC_CLIENT_SECRET
  assert.equal(oidcClients().some(c=>c.clientId==='office'),false)
 }finally{keys.forEach((k,i)=>{if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i]})}
})

test('Handshake signs Office identity tokens with the advertised issuer and role',async()=>{
 const {identityClaims}=await import('../src/lib/oidc')
 assert.deepEqual(identityClaims('https://handshake.axxes.club',{isSuperadmin:false}),{iss:'https://handshake.axxes.club',axxes_role:'member'})
 assert.equal(identityClaims('https://handshake.axxes.club',{isSuperadmin:true}).axxes_role,'superadmin')
})
