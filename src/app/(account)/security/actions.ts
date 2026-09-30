"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { revocableSession } from "@/lib/account/security";
type ActionResult = { ok: true } | { ok: false; error: string };
export async function revokeAccountSession(id: string): Promise<ActionResult> {
  try {
    const h=await headers(), current=await auth.api.getSession({headers:h});
    if(!current)return {ok:false,error:"Your session expired. Sign in again."};
    const sessions=await auth.api.listSessions({headers:h});
    const target=revocableSession(sessions,id,current.session.id);
    if(!target)return {ok:false,error:"This device is unavailable or is your current device."};
    await auth.api.revokeSession({headers:h,body:{token:target.token}});
    return {ok:true};
  }catch{return {ok:false,error:"The device could not be signed out. Try again."}}
}
export async function revokeOtherAccountSessions(): Promise<ActionResult> {
  try{const h=await headers();if(!await auth.api.getSession({headers:h}))return {ok:false,error:"Your session expired. Sign in again."};await auth.api.revokeOtherSessions({headers:h});return {ok:true}}catch{return {ok:false,error:"Other devices could not be signed out. Try again."}}
}
