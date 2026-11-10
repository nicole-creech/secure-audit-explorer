import type { Metadata } from "next";
import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import LayoutShell from "./LayoutShell";

export const metadata: Metadata = {
  title: "Secure Audit Log Explorer",
  description:
    "A full-stack investigation workspace for analyzing authentication, access, and privilege events across enterprise systems.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Reading request headers renders every page per request, which the
  // nonce-based CSP in src/proxy.ts requires (static pages can't carry a nonce).
  await headers();

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
