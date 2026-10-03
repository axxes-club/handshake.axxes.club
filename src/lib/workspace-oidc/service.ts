import {createHash,randomBytes,randomInt,randomUUID,timingSafeEqual} from 'node:crypto';
import {SignJWT,importJWK,type JWK} from 'jose';
export type User={id:string;name:string;email:string;emailVerified:boolean};
export type Client={id:string;redirects:string[];secret?:string};
export type Code={codeHash:string;userId:string;clientId:string;redirectUri:string;challenge:string;scopes:string;nonce:string;authTime:Date;expiresAt:Date};
export type Grant={id:string;userId:string;clientId:string;scopes:string;nonce:string;authTime:Date;accessHash:string;refreshHash:string;accessExpiresAt:Date;refreshExpiresAt:Date};
export type Key={id:string;privateJwk:JWK;publicJwk:JWK};
export interface Store {
 createCode(code:Code):Promise<void>;consumeCode(hash:string):Promise<Code|null>;
 createGrant(grant:Grant):Promise<void>;rotateGrant(hash:string,clientId:string,accessHash:string,refreshHash:string,accessExpiresAt:Date):Promise<Grant|null>;
 revoke(hash:string,clientId:string):Promise<void>;findAccess(hash:string):Promise<Grant|null>;user(id:string):Promise<User|null>;
 key():Promise<Key>;jwks():Promise<JWK[]>;
}
export class OAuthError extends Error {constructor(public code:string,public status=400){super(code)}}
export const hash=(value:string)=>'sha256:'+createHash('sha256').update(value).digest('hex');
const access=()=>Array.from({length:32},()=> 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[randomInt(52)]).join('');
const secretEqual=(a:string,b:string)=>{const ah=createHash('sha256').update(a).digest(),bh=createHash('sha256').update(b).digest();return timingSafeEqual(ah,bh)};
export function workspaceClients(env:Record<string,string|undefined>):Client[]{return [{id:'axxes-ios',redirects:['axxes://oauth/ios']},{id:'axxes-android',redirects:['axxes://oauth/android']},...(env.WORKSPACE_OIDC_CLIENT_SECRET?[{id:'axxes-workspace-web',redirects:['https://work.axxes.app/auth/callback','https://members.axxes.club/api/workspace/auth/callback'],secret:env.WORKSPACE_OIDC_CLIENT_SECRET}]:[])];}
export function createWorkspaceOidc({store,issuer,clients,now=()=>new Date()}:{store:Store;issuer:string;clients:Client[];now?:()=>Date}) {
 const client=(id:string)=>{const value=clients.find(c=>c.id===id);if(!value)throw new OAuthError('invalid_client',401);return value};
 const authenticate=(body:URLSearchParams)=>{const c=client(body.get('client_id')??'');if(c.secret&&!secretEqual(c.secret,body.get('client_secret')??''))throw new OAuthError('invalid_client',401);return c};
 function authorization(params:URLSearchParams){const c=client(params.get('client_id')??'');const redirect=params.get('redirect_uri')??'';
  if(!c.redirects.includes(redirect))throw new OAuthError('invalid_request');
  if(params.get('response_type')!=='code'||params.get('code_challenge_method')!=='S256'||! /^[A-Za-z0-9_-]{43}$/.test(params.get('code_challenge')??''))throw new OAuthError('invalid_request');
  for(const field of ['state','nonce'])if(!/^[A-Za-z0-9._~-]{16,256}$/.test(params.get(field)??''))throw new OAuthError('invalid_request');
  const scopes=[...new Set((params.get('scope')??'openid email profile').split(' '))];if(!scopes.includes('openid')||!scopes.includes('profile')||scopes.some(s=>!['openid','email','profile','offline_access'].includes(s)))throw new OAuthError('invalid_scope');
  return {c,redirect,scopes:scopes.join(' ')};
 }
 async function identity(grant:Grant){const user=await store.user(grant.userId);if(!user)throw new OAuthError('invalid_grant');const key=await store.key();const token=await new SignJWT({nonce:grant.nonce,auth_time:Math.floor(grant.authTime.getTime()/1000),name:user.name,...grant.scopes.split(' ').includes('email')?{email:user.email,email_verified:user.emailVerified}:{}}).setProtectedHeader({alg:'RS256',kid:key.id,typ:'JWT'}).setIssuer(issuer).setAudience(grant.clientId).setSubject(user.id).setIssuedAt(Math.floor(now().getTime()/1000)).setExpirationTime(Math.floor(grant.accessExpiresAt.getTime()/1000)).sign(await importJWK(key.privateJwk,'RS256'));return token;}
 async function response(grant:Grant,token:string,refresh:string){return {access_token:token,token_type:'Bearer',expires_in:Math.floor((grant.accessExpiresAt.getTime()-now().getTime())/1000),scope:grant.scopes,id_token:await identity(grant),...grant.scopes.split(' ').includes('offline_access')?{refresh_token:refresh}:{}};}
 return {
  authorization,
  async authorize(params:URLSearchParams,userId:string,authTime=now()){const {c,redirect,scopes}=authorization(params);if(!await store.user(userId))throw new OAuthError('access_denied',403);const code=randomBytes(32).toString('base64url');await store.createCode({codeHash:hash(code),userId,clientId:c.id,redirectUri:redirect,challenge:params.get('code_challenge')!,scopes,nonce:params.get('nonce')!,authTime,expiresAt:new Date(now().getTime()+90000)});const url=new URL(redirect);url.searchParams.set('code',code);url.searchParams.set('state',params.get('state')!);return url.href;},
  async token(body:URLSearchParams){const c=authenticate(body);const token=access(),refresh=randomBytes(48).toString('base64url'),accessExpiresAt=new Date(now().getTime()+600000);
   if(body.get('grant_type')==='refresh_token'){const old=body.get('refresh_token')??'';if(!/^[A-Za-z0-9_-]{64}$/.test(old))throw new OAuthError('invalid_grant');const grant=await store.rotateGrant(hash(old),c.id,hash(token),hash(refresh),accessExpiresAt);if(!grant||grant.refreshExpiresAt<=now()||!grant.scopes.split(' ').includes('offline_access'))throw new OAuthError('invalid_grant');return response(grant,token,refresh);}
   if(body.get('grant_type')!=='authorization_code')throw new OAuthError('unsupported_grant_type');
   const verifier=body.get('code_verifier')??'';if(!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))throw new OAuthError('invalid_grant');
   const code=body.get('code')??'';if(!/^[A-Za-z0-9_-]{43}$/.test(code))throw new OAuthError('invalid_grant');const record=await store.consumeCode(hash(code));
   if(!record||record.expiresAt<=now()||record.clientId!==c.id||record.redirectUri!==body.get('redirect_uri')||record.challenge!==createHash('sha256').update(verifier).digest('base64url'))throw new OAuthError('invalid_grant');
   const grant={id:randomUUID(),userId:record.userId,clientId:c.id,scopes:record.scopes,nonce:record.nonce,authTime:record.authTime,accessHash:hash(token),refreshHash:hash(refresh),accessExpiresAt,refreshExpiresAt:new Date(now().getTime()+30*86400000)};
   // Prepare identity first: a signing failure must never emit usable access credentials.
   const result=await response(grant,token,refresh);await store.createGrant(grant);return result;
  },
  async userinfo(token:string){if(!/^[A-Za-z]{32}$/.test(token))throw new OAuthError('invalid_token',401);const grant=await store.findAccess(hash(token));if(!grant||grant.accessExpiresAt<=now())throw new OAuthError('invalid_token',401);const u=await store.user(grant.userId);if(!u)throw new OAuthError('invalid_token',401);return {sub:u.id,name:u.name,...grant.scopes.split(' ').includes('email')?{email:u.email,email_verified:u.emailVerified}:{}};},
  async revoke(body:URLSearchParams){const c=authenticate(body);const token=body.get('token')??'';if(token.length>512)throw new OAuthError('invalid_request');await store.revoke(hash(token),c.id);},
  jwks:()=>store.jwks(),
  discovery:()=>({issuer,authorization_endpoint:issuer+'/authorize',token_endpoint:issuer+'/token',userinfo_endpoint:issuer+'/userinfo',revocation_endpoint:issuer+'/revoke',jwks_uri:issuer+'/jwks',response_types_supported:['code'],grant_types_supported:['authorization_code','refresh_token'],subject_types_supported:['public'],id_token_signing_alg_values_supported:['RS256'],token_endpoint_auth_methods_supported:['none','client_secret_post'],code_challenge_methods_supported:['S256'],scopes_supported:['openid','email','profile','offline_access']})
 };
}
