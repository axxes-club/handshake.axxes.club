import {platformAccessAllowed} from '../platform-access';
import {Pool} from 'pg';
import {createStore,type Database} from './store';
import {createWorkspaceOidc,workspaceClients} from './service';
const singleton=globalThis as unknown as {workspaceOidcPool?:Pool};
export function workspaceProvider(){
 const pool=singleton.workspaceOidcPool??=new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:5000,idleTimeoutMillis:30000});
 if(!pool.listenerCount('error'))pool.on('error',()=>console.error('Workspace identity database connection unavailable'));
 const db:Database={query:(text,values)=>pool.query(text,values),transaction:async work=>{const q=await pool.connect();try{await q.query('BEGIN');const result=await work(q);await q.query('COMMIT');return result;}catch(error){await q.query('ROLLBACK');throw error;}finally{q.release();}}};
 const origin=(process.env.BETTER_AUTH_URL??'https://handshake.axxes.club').replace(/\/$/,'');
 return createWorkspaceOidc({store:createStore(db,id=>platformAccessAllowed(id)),issuer:origin+'/api/workspace-oidc',clients:workspaceClients(process.env)});
}
