import * as React from "react";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
        A
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        AXXES <span className="font-normal text-zinc-500">Account</span>
      </span>
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-[420px] rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10 dark:border-zinc-800 dark:bg-zinc-900">
        <Brand />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-zinc-500">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-zinc-500">{footer}</div>}
      <p className="mt-10 text-xs text-zinc-400">One account for every AXXES product · Handshake</p>
    </main>
  );
}

export const inputClass =
  "h-12 w-full rounded-xl border border-zinc-300 bg-transparent px-4 text-[15px] outline-none transition focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/10 dark:border-zinc-700 dark:focus:border-white dark:focus:ring-white/10";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
        variant === "secondary" && "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
        variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        variant === "danger" && "text-red-600 hover:bg-red-50 dark:hover:bg-red-950",
        className
      )}
    />
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-xl px-4 py-3 text-sm",
        tone === "error" ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      )}
    >
      {children}
    </p>
  );
}
