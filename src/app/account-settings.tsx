"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, Button, Field, inputClass } from "@/components/ui";

type SessionInfo = { token: string; userAgent: string | null; ipAddress: string | null; createdAt: string };

function describeDevice(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

export function AccountSettings({ name, currentToken, sessions }: { name: string; currentToken: string; sessions: SessionInfo[] }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name);
  const [profileMsg, setProfileMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwMsg, setPwMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("name");
    const { error } = await authClient.updateUser({ name: displayName.trim() });
    setBusy(null);
    setProfileMsg(error ? { tone: "error", text: error.message ?? "Couldn't save" } : { tone: "success", text: "Name updated" });
    if (!error) router.refresh();
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("pw");
    const { error } = await authClient.changePassword({ currentPassword: pw.current, newPassword: pw.next, revokeOtherSessions: true });
    setBusy(null);
    if (error) setPwMsg({ tone: "error", text: error.message ?? "Couldn't change password" });
    else {
      setPw({ current: "", next: "" });
      setPwMsg({ tone: "success", text: "Password changed. Other devices were signed out." });
      router.refresh();
    }
  };

  const revoke = async (token: string) => {
    setBusy(token);
    await authClient.revokeSession({ token });
    setBusy(null);
    router.refresh();
  };

  const revokeOthers = async () => {
    setBusy("others");
    await authClient.revokeOtherSessions();
    setBusy(null);
    router.refresh();
  };

  const card = "card p-6";

  return (
    <>
      <section aria-labelledby="profile-heading" className="mt-12">
        <h2 id="profile-heading" className="mb-4 text-xl font-semibold tracking-tight">Profile</h2>
        <form onSubmit={saveName} className={`${card} grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end`}>
          <Field label="Name">
            <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </Field>
          <Button type="submit" disabled={busy === "name" || !displayName.trim() || displayName === name}>Save</Button>
          {profileMsg && <div className="sm:col-span-2"><Alert tone={profileMsg.tone}>{profileMsg.text}</Alert></div>}
        </form>
      </section>

      <section aria-labelledby="security-heading" className="mt-12">
        <h2 id="security-heading" className="mb-4 text-xl font-semibold tracking-tight">Security</h2>
        <form onSubmit={changePassword} className={`${card} grid gap-4`}>
          <p className="font-medium">Change password</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current password">
              <input type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className={inputClass} />
            </Field>
            <Field label="New password" hint="At least 8 characters.">
              <input type="password" required minLength={8} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputClass} />
            </Field>
          </div>
          {pwMsg && <Alert tone={pwMsg.tone}>{pwMsg.text}</Alert>}
          <div><Button type="submit" disabled={busy === "pw"}>Change password</Button></div>
        </form>

        <div className={`${card} mt-4`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">Where you&apos;re signed in</p>
            {sessions.length > 1 && (
              <Button variant="secondary" className="h-9" onClick={revokeOthers} disabled={busy === "others"}>Sign out other devices</Button>
            )}
          </div>
          <ul className="mt-4 divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.token} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {describeDevice(s.userAgent)}
                    {s.token === currentToken && <span className="ml-2 text-xs font-normal text-emerald-300">This device</span>}
                  </p>
                  <p className="text-xs text-muted">
                    Signed in {new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                  </p>
                </div>
                {s.token !== currentToken && (
                  <Button variant="danger" className="h-9" onClick={() => revoke(s.token)} disabled={busy === s.token}>Sign out</Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
