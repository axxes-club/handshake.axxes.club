import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {oidcClients,identityClaims,ALLOWED_SCOPES} from './oidc';
import {workspaceClients} from './workspace-oidc/service';
test('Workspace clients are isolated from the legacy provider and native clients carry no secret',()=>{
 const workspace=workspaceClients({WORKSPACE_OIDC_CLIENT_SECRET:'synthetic-web-secret-at-least-32-characters'});
 for(const id of ['axxes-ios','axxes-android']){const client=workspace.find(c=>c.id===id);assert.ok(client);assert.equal(client.secret,undefined);assert.ok(client.redirects.every(url=>!url.includes('*')));}
 assert.equal(workspace.find(c=>c.id==='axxes-workspace-web')?.redirects[0],'https://work.axxes.app/auth/callback');
 assert.ok(!oidcClients().some(c=>c.clientId.startsWith('axxes-')));
 assert.deepEqual(ALLOWED_SCOPES,['openid','email','profile']);
 assert.deepEqual(identityClaims('https://handshake.axxes.club',{isSuperadmin:true}),{iss:'https://handshake.axxes.club',axxes_role:'superadmin'});
});
test('Workspace flag never adds a global JWT plugin or changes legacy signing policy',()=>{
 for(const enabled of ['false','true']){
 const output=execFileSync(process.execPath,['--import','tsx','--input-type=module','-e',"import {auth} from './src/lib/auth.ts';console.log(JSON.stringify({ids:auth.options.plugins.map(p=>p.id),paths:auth.options.disabledPaths,oidc:auth.options.plugins.find(p=>p.id==='oidc').options}))"],{env:{...process.env,BETTER_AUTH_URL:'https://handshake.axxes.club',BETTER_AUTH_SECRET:'unit-only-placeholder-secret-at-least-32-chars',WORKSPACE_OIDC_ENABLED:enabled},encoding:'utf8'});
 const options=JSON.parse(output);assert.ok(!options.ids.includes('jwt'));assert.ok(options.ids.includes('oidc'));assert.ok(options.paths.includes('/sign-up/email'));assert.equal(options.oidc.useJWTPlugin,false);
 }
});
