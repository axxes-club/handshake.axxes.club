import test from 'node:test';
import assert from 'node:assert/strict';
import {oidcClients,identityClaims} from './oidc';
import {execFileSync} from 'node:child_process';
test('workspace clients are explicitly enabled and native clients never carry a secret',()=>{
  const enabled=process.env.WORKSPACE_OIDC_ENABLED,secret=process.env.WORKSPACE_OIDC_CLIENT_SECRET;
  try {
    process.env.WORKSPACE_OIDC_ENABLED='false';assert.ok(!oidcClients().some(c=>c.clientId==='axxes-ios'));
    process.env.WORKSPACE_OIDC_ENABLED='true';process.env.WORKSPACE_OIDC_CLIENT_SECRET='test-only-web-secret-at-least-32-chars';
    const clients=oidcClients();
    for(const id of ['axxes-ios','axxes-android']){const client=clients.find(c=>c.clientId===id);assert.ok(client);assert.equal(client.type,'public');assert.equal(client.clientSecret,undefined);assert.ok(client.redirectUrls.every(url=>!url.includes('*')));}
    assert.equal(clients.find(c=>c.clientId==='axxes-workspace-web')?.redirectUrls[0],'https://work.axxes.app/auth/callback');
  }finally {if(enabled===undefined)delete process.env.WORKSPACE_OIDC_ENABLED;else process.env.WORKSPACE_OIDC_ENABLED=enabled;if(secret===undefined)delete process.env.WORKSPACE_OIDC_CLIENT_SECRET;else process.env.WORKSPACE_OIDC_CLIENT_SECRET=secret;}
});

test('existing clients and issuer claims are preserved with workspace disabled',()=>{
 const previous=process.env.WORKSPACE_OIDC_ENABLED,office=process.env.OFFICE_OIDC_CLIENT_SECRET;
 try {process.env.WORKSPACE_OIDC_ENABLED='false';process.env.OFFICE_OIDC_CLIENT_SECRET='test-office-secret';
 assert.ok(oidcClients().some(c=>c.clientId==='office'));
 assert.ok(!oidcClients().some(c=>c.clientId.startsWith('axxes-')));
 assert.deepEqual(identityClaims('https://handshake.axxes.club',{isSuperadmin:true}),{iss:'https://handshake.axxes.club',axxes_role:'superadmin'});
 }finally {if(previous===undefined)delete process.env.WORKSPACE_OIDC_ENABLED;else process.env.WORKSPACE_OIDC_ENABLED=previous;if(office===undefined)delete process.env.OFFICE_OIDC_CLIENT_SECRET;else process.env.OFFICE_OIDC_CLIENT_SECRET=office;}
});
test('offline access scope is only exposed when the workspace flag is enabled',()=>{
 for(const enabled of ['false','true']) {
 const output=execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {ALLOWED_SCOPES} from './src/lib/oidc.ts';console.log(JSON.stringify(ALLOWED_SCOPES))"],{env:{...process.env,WORKSPACE_OIDC_ENABLED:enabled},encoding:'utf8'});
 assert.deepEqual(JSON.parse(output),['openid','email','profile',...(enabled==='true'?['offline_access']:[])]);
 }
});

test('JWT plugin and direct JWT token endpoint restrictions are explicitly gated',()=>{
 for(const enabled of ['false','true']) {
 const output=execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {auth} from './src/lib/auth.ts';console.log(JSON.stringify({ids:auth.options.plugins.map(p=>p.id),paths:auth.options.disabledPaths}))"],{env:{...process.env,BETTER_AUTH_URL:'https://handshake.axxes.club',BETTER_AUTH_SECRET:'unit-only-placeholder-secret-at-least-32-chars',WORKSPACE_OIDC_ENABLED:enabled},encoding:'utf8'});
 const options=JSON.parse(output);assert.equal(options.ids.includes('jwt'),enabled==='true');assert.equal(options.paths.includes('/token'),enabled==='true');assert.ok(options.ids.includes('oidc'));assert.ok(options.paths.includes('/sign-up/email'));
 }
});
