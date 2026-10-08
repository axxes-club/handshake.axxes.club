import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';
import {reserveInvite} from './invite-security';
test('one invite seat admits only one concurrent registration',async()=>{
 const db=new PGlite();await db.exec("CREATE TABLE invite_codes(id text,code text,is_active boolean,expires_at timestamptz,max_uses int,used_count int,updated_at timestamptz);INSERT INTO invite_codes VALUES('invite','ONE',true,NULL,1,0,now())");
 try{const results=await Promise.all(Array.from({length:12},()=>reserveInvite(db,'ONE')));assert.equal(results.filter(Boolean).length,1);assert.equal((await db.query<{used_count:number}>('SELECT used_count FROM invite_codes')).rows[0].used_count,1);}finally{await db.close();}
});
test('expired inactive and exhausted invite codes never enroll a user',async()=>{
 const db=new PGlite();await db.exec("CREATE TABLE invite_codes(id text,code text,is_active boolean,expires_at timestamptz,max_uses int,used_count int,updated_at timestamptz);INSERT INTO invite_codes VALUES('inactive','OFF',false,NULL,1,0,now()),('expired','OLD',true,now()-interval '1 day',1,0,now()),('used','USED',true,NULL,1,1,now())");
 try{for(const code of ['OFF','OLD','USED','MISSING'])assert.equal(await reserveInvite(db,code),false);}finally{await db.close();}
});
