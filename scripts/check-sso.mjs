import {readFileSync} from 'node:fs';
import {randomUUID,createHmac} from 'node:crypto';
import { neon } from '@neondatabase/serverless';
const env=Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url),'utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sql=neon(env.DATABASE_URL),id=randomUUID(),sid=randomUUID(),token=randomUUID();
const cookie='__Secure-better-auth.session_token='+encodeURIComponent(token+'.'+createHmac('sha256',env.BETTER_AUTH_SECRET).update(token).digest('base64'));
let failures=0;
try {
 await sql`insert into "user" (id,name,email,email_verified) values (${id},'Handshake verification',${'handshake-probe-'+id+'@example.invalid'},false)`;
 await sql`insert into session (id,token,user_id,expires_at) values (${sid},${token},${id},now()+interval '5 minutes')`;
 for(const host of ['handshake','members','relay','manifest','binnacle','keel','pulse','lanes','nexus','folders','kr8s','quill','matters','developer','vibez','tollbooth']) {
  const response=await fetch(`https://${host}.axxes.club/api/auth/get-session`,{headers:{cookie},signal:AbortSignal.timeout(15000)});
  let data;try{data=await response.json()}catch{};
  const valid=response.status===200 && data?.user?.id===id;
  if(!valid) failures++;
  console.log(host,response.status,valid?'SSO PASS':'SSO FAIL');
 }
 const account=await fetch('https://handshake.axxes.club/',{headers:{cookie},redirect:'manual',signal:AbortSignal.timeout(15000)});
 const html=await account.text();
 const validAccount=account.status===200 && ['Manifest','Matter','Relay','AXXES Office','Binnacle','Keel','AXXES Developers'].every(name=>html.includes(name));
 if(!validAccount) failures++;
 console.log('Signed-in account catalog',validAccount?'PASS':'FAIL');
} finally {await sql`delete from session where id=${sid}`;await sql`delete from "user" where id=${id}`;console.log('Temporary verification account removed');}

process.exitCode=failures?1:0;
