import * as React from "react";
import Link from "next/link";
import { CATEGORIES, FALLBACK_PRODUCTS, type Product } from "@/lib/products";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/" className={cx("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-ink">A</span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">AXXES</span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Account · Handshake</span>
      </span>
    </Link>
  );
}

export function ProductMark({ product, size = "md" }: { product: Product; size?: "sm" | "md" }) {
  return (
    <span
      className={cx("grid shrink-0 place-items-center rounded-xl font-mono font-bold text-[#0a0a0b]", size === "sm" ? "size-8 text-xs" : "size-11 text-base")}
      style={{ background: product.color }}
    >
      {product.name.replace(/^AXXES /, "")[0]}
    </span>
  );
}

function Status({ product }: { product: Product }) {
  if (product.status === "soon") return <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted ring-1 ring-white/10">Soon</span>;
  if (product.status === "beta") return <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent ring-1 ring-accent/20">Beta</span>;
  return null;
}

// The whole product family, grouped by category
/**
 * The product grid.
 *
 * `products` is passed in rather than read from a module-level array, so the
 * page — a server component — can supply the live catalog from `axxes_product`.
 * The default is the fallback list, which keeps this usable from a client
 * component and means a call site that forgets to pass products still renders
 * the products we know about instead of nothing.
 */
export function ProductGrid({ compact = false, products = FALLBACK_PRODUCTS }: { compact?: boolean; products?: Product[] }) {
  return (
    <div className="space-y-10">
      {CATEGORIES.map((cat) => {
        const items = products.filter((p) => p.category === cat.key);
        if (!items.length) return null;
        return (
          <section key={cat.key} aria-labelledby={`cat-${cat.key}`}>
            <div className="mb-3 flex items-baseline gap-3">
              <h3 id={`cat-${cat.key}`} className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{cat.key}</h3>
              <p className="text-xs text-muted">{cat.blurb}</p>
            </div>
            <div className={cx("grid gap-3", cat.key === "Suite" ? "" : "sm:grid-cols-2 lg:grid-cols-3")}>
              {items.map((p) => {
                const soon = p.status === "soon";
                const Tag = soon ? "div" : "a";
                return (
                  <Tag
                    key={p.key}
                    {...(soon ? {} : { href: p.url })}
                    data-product={p.key}
                    className={cx(
                      "card group flex gap-4 p-5 transition",
                      soon ? "opacity-60" : "hover:border-accent/40 hover:bg-panel-2",
                      cat.key === "Suite" && "items-center sm:p-6"
                    )}
                  >
                    <ProductMark product={p} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <Status product={p} />
                        {!p.sso && !soon && <span className="font-mono text-[10px] uppercase tracking-wider text-muted">Separate login</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-text/80">{p.tagline}</span>
                      {!compact && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{p.description}</span>}
                      <span className="mt-2 block font-mono text-[11px] text-muted group-hover:text-accent">{p.url.replace("https://", "")}</span>
                    </span>
                  </Tag>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer, products = FALLBACK_PRODUCTS }: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  products?: Product[];
}) {
  const sso = products.filter((p) => p.sso || p.status === "live");
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Brand />
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </div>
        <p className="text-xs text-muted">
          <Link href="/apps" className="hover:text-text">All AXXES products</Link> · <a href="https://axxes.club" className="hover:text-text">axxes.club</a>
        </p>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-line bg-panel lg:flex lg:flex-col lg:justify-center lg:px-14" aria-label="AXXES products">
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-accent/10 blur-[120px]" />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.25em] text-accent">One account</p>
        <h2 className="relative mt-4 max-w-md text-4xl font-semibold leading-tight tracking-tight">Sign in once. Every AXXES app opens.</h2>
        <ul className="relative mt-10 grid max-w-lg grid-cols-2 gap-3">
          {sso.map((p) => (
            <li key={p.key} className="flex items-center gap-3 rounded-xl border border-line bg-bg/60 p-3">
              <ProductMark product={p} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="block truncate text-xs text-muted">{p.tagline}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  );
}

export const inputClass = "input h-11 text-[15px]";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
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
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-ghost",
        variant === "ghost" && "btn text-muted hover:bg-panel-2 hover:text-text",
        variant === "danger" && "btn-danger",
        "h-11 px-5",
        className
      )}
    />
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cx("rounded-xl px-4 py-3 text-sm ring-1", tone === "error" ? "bg-red-400/10 text-red-300 ring-red-400/20" : "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20")}
    >
      {children}
    </p>
  );
}
