"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { passwordReturn, pulseReturnPath } from "@/lib/signup-policy";
import { safeRedirect } from "@/lib/redirect";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const next = passwordReturn(safeRedirect(params.get("redirect")));
  const pulse = pulseReturnPath(next) !== null;
  const query = next === "/" ? "" : `?redirect=${encodeURIComponent(next)}`;
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") ? "This reset link is invalid or has expired." : null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setPending(false);
    if (error) setError(error.message ?? "Couldn't reset your password");
    else setDone(true);
  };

  return (
    <AuthShell
      originatingProduct={pulse ? "pulse" : undefined}
      title={pulse ? "Choose a new password for your Pulse sign-in" : "Choose a new password"}
      subtitle={pulse ? "This updates your AXXES account password. Sign in again to return to Pulse." : undefined}
      footer={<Link href={`/sign-in${query}`} className="font-medium text-accent hover:underline">Back to sign in</Link>}
    >
      {done ? <div className="grid gap-4">
        <Alert tone="success">Your password was changed.</Alert>
        <Link href={`/sign-in${query}`} className="btn-primary h-11">{pulse ? "Sign in to Pulse" : "Sign in"}</Link>
      </div> : <form onSubmit={submit} className="grid gap-4">
        <Field label="New password" hint="At least 8 characters.">
          <input type="password" required minLength={8} autoFocus autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        {(error || !token) && <><Alert>{error ?? "This reset link is missing its token. Request a new one."}</Alert><Link href={`/forgot-password${query}`} className="text-sm text-accent">Request a new reset link</Link></>}
        <Button type="submit" disabled={pending || !token} className="mt-2 w-full">{pending ? "Saving…" : "Save new password"}</Button>
      </form>}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
