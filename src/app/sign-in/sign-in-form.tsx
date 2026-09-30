"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";

export function SignInForm({ next, products }: { next: string; products: Product[] }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const query = next === "/" ? "" : `?redirect=${encodeURIComponent(next)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    // Addresses are stored lowercased, so a mixed-case entry like
    // viscasillas@Me.com has to be folded before better-auth looks it up.
    const { data, error } = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
    if (error) {
      setError(error.message ?? "Couldn't sign you in");
      setPending(false);
      return;
    }
    // Mid-OIDC sign-in: Handshake answers with the product's callback URL
    window.location.assign(data?.redirect && data.url ? data.url : next);
  };

  return (
    <AuthShell
      products={products}
      title="Sign in"
      subtitle="Use your AXXES account to continue."
      footer={<>New to AXXES? <Link href={`/sign-up${query}`} className="font-medium text-accent hover:underline">Create an account</Link></>}
    >
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email">
          <input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Password">
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </Field>
        {error && <Alert>{error}</Alert>}
        <div className="mt-2 flex items-center justify-between">
          <Link href={`/forgot-password${query}`} className="text-sm text-muted hover:text-text">
            Forgot password?
          </Link>
          <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
        </div>
      </form>
    </AuthShell>
  );
}
