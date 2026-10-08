"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { passwordReturn, pulseReturnPath } from "@/lib/signup-policy";
import { safeRedirect } from "@/lib/redirect";
import { authClient } from "@/lib/auth-client";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";

function ForgotPasswordForm() {
  const params = useSearchParams();
  const next = passwordReturn(safeRedirect(params.get("redirect")));
  const pulse = pulseReturnPath(next) !== null;
  const query = next === "/" ? "" : `?redirect=${encodeURIComponent(next)}`;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    // Same folding as sign-in: stored addresses are lowercased.
    const { error } = await authClient.requestPasswordReset({ email: email.trim().toLowerCase(), redirectTo: `/reset-password${query}` });
    setPending(false);
    if (error) setError(error.message ?? "Something went wrong");
    else setSent(true);
  };

  return (
    <AuthShell
      originatingProduct={pulse ? "pulse" : undefined}
      title={pulse ? "Get back to Pulse" : "Reset your password"}
      subtitle={pulse ? "We'll email you a link to reset your AXXES account password, then return you to Pulse." : "We'll email you a link to choose a new one."}
      footer={<Link href={`/sign-in${query}`} className="font-medium text-accent hover:underline">Back to sign in</Link>}
    >
      {sent ? (
        <Alert tone="success">If an account exists for {email}, a reset link is on its way. It expires in 1 hour.</Alert>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Email">
            <input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          {error && <Alert>{error}</Alert>}
          <Button type="submit" disabled={pending} className="mt-2 w-full">{pending ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense><ForgotPasswordForm /></Suspense>;
}
