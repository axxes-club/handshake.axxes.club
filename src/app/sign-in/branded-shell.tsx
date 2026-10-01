import type { SignInBrand } from "@/lib/white-label";

/**
 * The sign-in page in a white-label customer's own name: their logo, color and
 * words, with AXXES reduced to a "Powered by" line. A light page regardless of
 * the AXXES theme, since customers' logos are usually drawn for white.
 */
export function BrandedShell({ brand, children }: { brand: SignInBrand; children: React.ReactNode }) {
  return (
    <main
      className="grid min-h-dvh bg-white text-neutral-900 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      // The theme's accent (button, focus ring, links) becomes the customer's color.
      style={{ "--accent": brand.accent, "--product-accent": brand.accent, "--accent-ink": "#ffffff" } as React.CSSProperties}
    >
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex h-14 items-center">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt={brand.name} className="max-h-14 max-w-[240px] object-contain" />
          ) : (
            <span className="text-lg font-semibold">{brand.name}</span>
          )}
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{brand.headline}</h1>
          {brand.tagline && <p className="mt-2 text-neutral-500">{brand.tagline}</p>}
          <div className="mt-8 [&_input]:bg-white [&_input]:text-neutral-900">{children}</div>
          {brand.notice && <p className="mt-8 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">{brand.notice}</p>}
        </div>
        <p className="text-xs text-neutral-400">
          Powered by <a href="https://axxes.club" className="hover:text-neutral-600">AXXES</a>
        </p>
      </div>
      <aside
        className="relative hidden items-center justify-center overflow-hidden bg-cover bg-center lg:flex"
        style={{ backgroundColor: brand.accent, ...(brand.bannerUrl ? { backgroundImage: `url(${JSON.stringify(brand.bannerUrl)})` } : {}) }}
        aria-hidden
      >
        {brand.bannerUrl ? null : brand.logoDarkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoDarkUrl} alt="" className="max-h-40 max-w-[60%] object-contain opacity-95" />
        ) : (
          <span className="px-12 text-center text-4xl font-semibold leading-tight text-white/95">{brand.name}</span>
        )}
      </aside>
    </main>
  );
}
