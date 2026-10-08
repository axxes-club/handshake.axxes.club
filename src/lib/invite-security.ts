export async function reserveInvite(db:{query:(text:string,values:unknown[])=>Promise<{rows:unknown[]}>},code:string):Promise<boolean>{
 const result=await db.query(`UPDATE invite_codes SET used_count=used_count+1,updated_at=now()
  WHERE code=$1 AND is_active=true AND (expires_at IS NULL OR expires_at>now())
   AND (max_uses IS NULL OR max_uses=0 OR used_count<max_uses) RETURNING id`,[code]);
 return result.rows.length===1;
}
