"use server";

import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inviteCodes } from "@/lib/schema";
import { allowSignupAttempt, signupClientAddress } from "@/lib/signup-rate-limit";
import { isPulseSignupReturn } from "@/lib/signup-policy";

type Result = { ok: true } | { ok: false; error: string };

// Pulse is publicly available; other products retain their invitation policy.
export async function signUpWithInvite(input: { name: string; email: string; password: string; inviteCode: string; next?: string }): Promise<Result> {
  const requestHeaders = await headers();
  if (!allowSignupAttempt(signupClientAddress(requestHeaders))) return { ok: false, error: "Too many signup attempts. Please wait a minute and try again." };
  const code = input.inviteCode.trim().toUpperCase();
  const pulseSignup = isPulseSignupReturn(input.next);
  if (!pulseSignup && !code) return { ok: false, error: "An invite code is required" };

  const [invite] = pulseSignup ? [] : await db.select().from(inviteCodes).where(eq(inviteCodes.code, code));
  if (!pulseSignup) {
    if (!invite) return { ok: false, error: "That invite code isn't valid" };
    if (!invite.isActive) return { ok: false, error: "That invite code is no longer active" };
    if (invite.expiresAt && invite.expiresAt < new Date()) return { ok: false, error: "That invite code has expired" };
    if (invite.maxUses && invite.usedCount >= invite.maxUses) return { ok: false, error: "That invite code has been used up" };
  }

  try {
    await auth.api.signUpEmail({
      headers: requestHeaders,
      body: { name: input.name.trim(), email: input.email.trim().toLowerCase(), password: input.password },
    });
  } catch (err) {
    if (err instanceof APIError) return { ok: false, error: err.body?.message ?? "Couldn't create your account" };
    throw err;
  }

  if (invite) await db
    .update(inviteCodes)
    .set({ usedCount: sql`${inviteCodes.usedCount} + 1`, updatedAt: new Date() })
    .where(eq(inviteCodes.id, invite.id));
  return { ok: true };
}
