"use client";

import Link from "next/link";
import { useState } from "react";
import { signUpWithInvite } from "@/app/actions";
import { Alert, AuthShell, Button, Field, inputClass } from "@/components/ui";

export function SignUpForm({ next, initialCode }: { next: string; initialCode: string }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: initialCode });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await signUpWithInvite(form);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    window.location.assign(next);
  };

  return (
    <AuthShell
      title="Create your AXXES account"
      subtitle="One account for the AXXES Suite, Folders, Krates, Tollbooth and more."
      footer={<>Already have an account? <Link href={`/sign-in?redirect=${encodeURIComponent(next)}`} className="font-medium text-accent hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Full name">
          <input required autoFocus autoComplete="name" value={form.name} onChange={set("name")} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={inputClass} />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} className={inputClass} />
        </Field>
        <Field label="Invite code" hint="AXXES is invite-only for now.">
          <input required value={form.inviteCode} onChange={set("inviteCode")} className={`${inputClass} uppercase tracking-wider`} />
        </Field>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={pending} className="mt-2 w-full">{pending ? "Creating account…" : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
