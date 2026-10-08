import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {AuthShell} from '../src/components/ui';
test('Pulse authentication shell keeps the originating product and hides unrelated product promotion',()=>{
 const props={title:'Sign in to Pulse',originatingProduct:'pulse' as const,children:'Form'};
 const html=renderToStaticMarkup(createElement(AuthShell,props));
 assert.match(html,/Return to Pulse/);assert.match(html,/href="https:\/\/pulse\.axxes\.app"/);
 assert.doesNotMatch(html,/Every AXXES app opens|All AXXES products|AXXES products|Krates/);
});
test('other authentication keeps the established AXXES shell',()=>{
 const props={title:'Sign in',children:'Form'};
 const html=renderToStaticMarkup(createElement(AuthShell,props));
 assert.match(html,/Every AXXES app opens/);assert.match(html,/All AXXES products/);
});

import {SearchParamsContext} from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import ForgotPasswordPage from '../src/app/forgot-password/page';
import ResetPasswordPage from '../src/app/reset-password/page';
import {SignInForm} from '../src/app/sign-in/sign-in-form';
const returnTarget='https://pulse.axxes.club/api/auth/bridge/issue?state='+ 's'.repeat(43)+'&returnTo='+encodeURIComponent('/dashboard/pages?site=app_a');
function pageWithReturn(component: typeof ForgotPasswordPage){
 return renderToStaticMarkup(createElement(SearchParamsContext.Provider,{value:new URLSearchParams({redirect:returnTarget,token:'fixture'})},createElement(component)));
}
test('Pulse sign-in keeps the destination in signup and restarts the bridge for forgotten passwords',()=>{
 const html=renderToStaticMarkup(createElement(SignInForm,{next:returnTarget}));
 assert.match(html,/Sign in to Pulse/);assert.doesNotMatch(html,/Every AXXES app opens/);
 assert.ok(html.includes('/sign-up?redirect='+encodeURIComponent(returnTarget)));
 assert.ok(html.includes('/forgot-password?redirect='+encodeURIComponent('https://pulse.axxes.club/sign-in?returnTo='+encodeURIComponent('/dashboard/pages?site=app_a'))));
});
test('forgotten and reset password pages retain Pulse context and a durable return',()=>{
 for(const component of [ForgotPasswordPage,ResetPasswordPage]){
 const html=pageWithReturn(component);
 assert.match(html,/Return to Pulse/);assert.doesNotMatch(html,/Every AXXES app opens/);
 assert.ok(html.includes('/sign-in?redirect='+encodeURIComponent('https://pulse.axxes.club/sign-in?returnTo='+encodeURIComponent('/dashboard/pages?site=app_a'))));
 }
});

test('switching from password recovery to registration preserves invite-free Pulse context',()=>{
 const target='https://pulse.axxes.club/sign-in?returnTo='+encodeURIComponent('/dashboard/pages?site=app_a');
 const html=renderToStaticMarkup(createElement(SignInForm,{next:target}));
 assert.ok(html.includes('/sign-up?redirect='+encodeURIComponent('https://pulse.axxes.club/dashboard/pages?site=app_a')));
});
