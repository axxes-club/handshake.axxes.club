"use server";

import {reserveInvite} from "@/lib/invite-security";
import {securityPool,admitRequest} from "@/lib/security/admission-server";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";


type Result = { ok: true } | { ok: false; error: string };

// Invite-only sign-up: check the code, create the account (which signs the user in), then use up the code
export async function signUpWithInvite(input: { name: string; email: string; password: string; inviteCode: string }): Promise<Result> {
  const code = input.inviteCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "An invite code is required" };

  await admitRequest(new Request('https://handshake.axxes.club/invite'), 'invite-enrollment', 600);
  if(!await reserveInvite(securityPool(),code))return {ok:false,error:"That invite code is invalid, expired, inactive or used up"};

  try {
    await auth.api.signUpEmail({
      body: { name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password },
    });
  } catch (err) {
    if (err instanceof APIError) return { ok: false, error: err.body?.message ?? "Couldn't create your account" };
    throw err;
  }

  return { ok: true };
}
