import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AXXES Account", template: "%s · AXXES Account" },
  description: "One AXXES account for every product: the AXXES Suite, Folders, Lanes, Vibez, Tollbooth and more.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ "--product-accent": "#c8ff3d" } as React.CSSProperties}>
      <body className={`${sans.variable} ${mono.variable} min-h-dvh`}>{children}</body>
    </html>
  );
}
