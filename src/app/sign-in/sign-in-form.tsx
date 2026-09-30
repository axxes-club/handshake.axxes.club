"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";
import type { SignInBrand } from "@/lib/white-label";
import { BrandedShell } from "./branded-shell";

/** Words for the branded page, which follows the visitor's language. */
const WORDS = {
  en: { email: "Email", password: "Password", forgot: "Forgot password?", signIn: "Sign in", signingIn: "Signing in…", failed: "Couldn't sign you in" },
  es: { email: "Correo electrónico", password: "Contraseña", forgot: "¿Olvidaste tu contraseña?", signIn: "Iniciar sesión", signingIn: "Iniciando sesión…", failed: "No pudimos iniciar tu sesión" },
};

export function SignInForm({ next, brand, locale = "en" }: { next: string; brand?: SignInBrand; locale?: "en" | "es" }) {
  const w = brand ? WORDS[locale] : WORDS.en;
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
      setError(error.message ?? w.failed);
      setPending(false);
      return;
    }
    // Mid-OIDC sign-in: Handshake answers with the product's callback URL
    window.location.assign(data?.redirect && data.url ? data.url : next);
  };

  const form = (
    <form onSubmit={submit} className="grid gap-4">
      <Field label={w.email}>
        <input type="email" required autoFocus autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </Field>
      <Field label={w.password}>
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <div className="mt-2 flex items-center justify-between">
        <Link href={`/forgot-password${query}`} className="text-sm text-muted hover:text-text">
          {w.forgot}
        </Link>
        <Button type="submit" disabled={pending}>{pending ? w.signingIn : w.signIn}</Button>
      </div>
    </form>
  );

  if (brand) return <BrandedShell brand={brand}>{form}</BrandedShell>;

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your AXXES account to continue."
      footer={<>New to AXXES? <Link href={`/sign-up${query}`} className="font-medium text-accent hover:underline">Create an account</Link></>}
    >
      {form}
    </AuthShell>
  );
}
