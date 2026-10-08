"use server";

import {headers} from "next/headers";
import {isPulseSignupReturn} from "@/lib/signup-policy";
import {admitSignup} from "@/lib/signup-security";
import {reserveInvite} from "@/lib/invite-security";
import {securityPool} from "@/lib/security/admission-server";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";


type Result = { ok: true } | { ok: false; error: string };

// Preserve live public Pulse enrollment; all other destinations require atomic invitation reservation.
export async function signUpWithInvite(input: { name: string; email: string; password: string; inviteCode: string; next?: string }): Promise<Result> {
  if(!input||typeof input.email!=="string"||input.email.length>254||typeof input.name!=="string"||input.name.length>200||typeof input.password!=="string"||input.password.length>4096||typeof input.inviteCode!=="string"||input.inviteCode.length>128)return {ok:false,error:"Invalid signup details"};
  const code = input.inviteCode.trim().toUpperCase();
  const pulseSignup=isPulseSignupReturn(input.next);
  if (!pulseSignup && !code) return { ok: false, error: "An invite code is required" };

  const requestHeaders=await headers();
  await admitSignup(securityPool(),requestHeaders,input.email);
  if(!pulseSignup && !await reserveInvite(securityPool(),code))return {ok:false,error:"That invite code is invalid, expired, inactive or used up"};

  try {
    await auth.api.signUpEmail({
      headers:requestHeaders,
      body: { name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password },
    });
  } catch (err) {
    if (err instanceof APIError) return { ok: false, error: err.body?.message ?? "Couldn't create your account" };
    throw err;
  }

  return { ok: true };
}
