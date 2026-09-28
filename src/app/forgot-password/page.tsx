"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (error) setError(error.message ?? "Something went wrong");
    else setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a link to choose a new one."
      footer={<Link href="/sign-in" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-white">Back to sign in</Link>}
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
