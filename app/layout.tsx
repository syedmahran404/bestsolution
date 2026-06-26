import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Velora Civic AI — AI Civic Operations Center",
  description:
    "An AI-powered civic intelligence platform. Citizens report issues; AI agents classify, score, aggregate, route, and help resolve them.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Applied before paint to avoid a theme flash. Follows the user's saved
  // choice, otherwise the OS preference (dark-mode first for dark-OS users).
  const themeInit = `(function(){try{var t=localStorage.getItem('velora.theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
