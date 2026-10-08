import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPulseSignupReturn } from '../src/lib/signup-policy';

test('Pulse signup accepts only exact secure Pulse destinations', () => {
  assert.equal(isPulseSignupReturn('https://pulse.axxes.club/dashboard'), true);
  assert.equal(isPulseSignupReturn(`https://pulse.axxes.club/api/auth/bridge/issue?state=${'a'.repeat(43)}`), true);
  for (const target of [undefined, '/dashboard', 'https://members.axxes.club/onboarding', 'https://pulse.axxes.club.evil.com/dashboard', 'http://pulse.axxes.club/dashboard', 'https://pulse.axxes.club@evil.com/dashboard', 'https://pulse.axxes.club/other', 'https://pulse.axxes.club/api/auth/bridge/issue?state=bad', 'https://pulse.axxes.app/dashboard']) {
    assert.equal(isPulseSignupReturn(target), false, String(target));
  }
});

import { allowSignupAttempt, signupClientAddress } from '../src/lib/signup-rate-limit';
test('signup throttles bursts, isolates clients, and permits retry after the window', () => {
  for (let i = 0; i < 10; i++) assert.equal(allowSignupAttempt('client-a', 1000), true);
  assert.equal(allowSignupAttempt('client-a', 1000), false);
  assert.equal(allowSignupAttempt('client-b', 1000), true);
  assert.equal(allowSignupAttempt('client-a', 61000), true);
  assert.equal(signupClientAddress(new Headers({'x-forwarded-for': 'spoofed, 198.51.100.1, 203.0.113.2'})), '198.51.100.1');
});

import { pulseReturnPath, passwordReturn } from '../src/lib/signup-policy';
test('recognizes Pulse dashboard pages and preserves their path and query through auth', () => {
  const path='/dashboard/funnels?site=app_123&funnel=goal_a';
  assert.equal(isPulseSignupReturn('https://pulse.axxes.club'+path),true);
  assert.equal(pulseReturnPath('https://pulse.axxes.club'+path),path);
  const bridge='https://pulse.axxes.club/api/auth/bridge/issue?state='+ 's'.repeat(43)+'&returnTo='+encodeURIComponent(path);
  assert.equal(pulseReturnPath(bridge),path);
  assert.equal(isPulseSignupReturn(bridge),true);
});
test('password recovery restarts a fresh Pulse bridge instead of retaining its expiring state', () => {
  const path='/dashboard/pages?site=app_123';
  const bridge='https://pulse.axxes.club/api/auth/bridge/issue?state='+ 's'.repeat(43)+'&returnTo='+encodeURIComponent(path);
  const target=passwordReturn(bridge);
  const parsed=new URL(target);
  assert.equal(parsed.origin,'https://pulse.axxes.club');assert.equal(parsed.pathname,'/sign-in');
  assert.equal(parsed.searchParams.get('returnTo'),path);assert.equal(parsed.searchParams.has('state'),false);
  assert.equal(passwordReturn(target),target);
  assert.equal(pulseReturnPath(target),path);
  assert.equal(isPulseSignupReturn(target),false);
  assert.equal(passwordReturn('/api/auth/oauth2/authorize?client_id=example'),'/api/auth/oauth2/authorize?client_id=example');
});
test('rejects disguised Pulse and unsafe nested dashboard returns', () => {
  for(const target of ['https://pulse.axxes.club/dashboard-other','https://pulse.axxes.club/dashboard/../other','https://pulse.axxes.club/api/auth/bridge/issue?state='+ 's'.repeat(43)+'&returnTo='+encodeURIComponent('//evil.com/dashboard'),'https://pulse.axxes.club/sign-in?returnTo='+encodeURIComponent('/other')]){
    assert.equal(pulseReturnPath(target),null,target);assert.equal(isPulseSignupReturn(target),false,target);
  }
});

test('bounds dashboard return paths and rejects encoded path confusion',()=>{
 for(const path of ['/dashboard%2fother','/dashboard/\\evil.com','/dashboard?query='+ 'a'.repeat(2000)])
   assert.equal(pulseReturnPath('https://pulse.axxes.club'+path),null,path);
});
