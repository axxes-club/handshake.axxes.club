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
