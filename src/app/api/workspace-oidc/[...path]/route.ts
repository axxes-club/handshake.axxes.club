import {auth} from '@/lib/auth';
import {workspaceProvider} from '@/lib/workspace-oidc/runtime';
import {OAuthError} from '@/lib/workspace-oidc/service';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff'};
function error(value:unknown){if(value instanceof OAuthError)return Response.json({error:value.code},{status:value.status,headers});console.error('Workspace identity request failed');return Response.json({error:'server_error'},{status:503,headers});}
async function handle(request:Request,context:{params:Promise<{path:string[]}>}){
 if(process.env.WORKSPACE_OIDC_ENABLED!=='true')return Response.json({error:'temporarily_unavailable'},{status:503,headers});
 try {
  const action=(await context.params).path.join('/'),provider=workspaceProvider();
  if(request.method==='GET'&&action==='.well-known/openid-configuration')return Response.json(provider.discovery(),{headers});
  if(request.method==='GET'&&action==='jwks')return Response.json({keys:await provider.jwks()},{headers:{...headers,'Access-Control-Allow-Origin':'*'}});
  if(request.method==='GET'&&action==='authorize'){
   const url=new URL(request.url);provider.authorization(url.searchParams);
   const session=await auth.api.getSession({headers:request.headers});
   if(!session){const login=new URL('/sign-in',process.env.BETTER_AUTH_URL);login.searchParams.set('redirect',url.pathname+url.search);return new Response(null,{status:302,headers:{...headers,Location:login.href}});}
   return new Response(null,{status:302,headers:{...headers,Location:await provider.authorize(url.searchParams,session.user.id,new Date(session.session.createdAt))}});
  }
  if(request.method==='GET'&&action==='userinfo'){const bearer=request.headers.get('authorization')??'';if(!bearer.startsWith('Bearer '))throw new OAuthError('invalid_token',401);return Response.json(await provider.userinfo(bearer.slice(7)),{headers});}
  if(request.method==='POST'&&(action==='token'||action==='revoke')){
   if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))throw new OAuthError('invalid_request');const raw=await request.text();if(raw.length>8192)throw new OAuthError('invalid_request');const body=new URLSearchParams(raw);
   if(action==='revoke'){await provider.revoke(body);return new Response(null,{status:200,headers});}
   return Response.json(await provider.token(body),{headers});
  }
  return Response.json({error:'invalid_request'},{status:404,headers});
 }catch(value){return error(value);}
}
export const GET=handle,POST=handle;
