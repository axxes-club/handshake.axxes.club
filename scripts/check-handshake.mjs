const base=process.argv[2] || 'https://handshake.axxes.club';
let failures=0;
for(const path of ['/sign-in','/sign-up']) {
 const html=await (await fetch(base+path)).text();
 for(const name of ['Manifest','Matter','Relay','AXXES Office','Binnacle','Keel','AXXES Developers']) {
  if(!html.includes(name)) {console.error(`FAIL ${path}: missing ${name}`);failures++;}
 }
 if(/>Stock</.test(html)) {console.error(`FAIL ${path}: obsolete Stock name`);failures++;}
}
const html=await(await fetch(base+'/apps')).text();
if(!html.includes('cat-Support')) {console.error('FAIL /apps: missing Support category');failures++;}
process.exitCode=failures?1:0;
if(!failures)console.log('PASS live catalog on sign-in, sign-up and apps');
