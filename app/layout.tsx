import type { Metadata, Viewport } from "next";
import {
  Inter,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Kannada,
  Noto_Sans_Telugu,
} from "next/font/google";

import "./globals.css";
import { LanguagePicker } from "@/components/i18n/language-picker";
import { I18nProvider } from "@/lib/i18n/provider";
import { getInitialLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Indic-script faces, loaded once and exposed as CSS variables. The body font
// stack (globals.css) falls through these so Devanagari (Hindi/Marathi),
// Kannada, Bengali, and Telugu render with correct typography.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-deva",
  display: "swap",
});
const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-knda",
  display: "swap",
});
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-beng",
  display: "swap",
});
const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  variable: "--font-telu",
  display: "swap",
});

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

  // Server-resolved locale (from cookie) seeds the client provider and the
  // <html lang> attribute, avoiding a locale flash on first paint.
  const locale = getInitialLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          notoDevanagari.variable,
          notoKannada.variable,
          notoBengali.variable,
          notoTelugu.variable,
        )}
      >
        <I18nProvider initialLocale={locale}>
          {children}
          <LanguagePicker />
        </I18nProvider>
      </body>
    </html>
  );
}
