import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

/**
 * Generated OpenGraph / social-share card (App Router convention).
 *
 * Runs on the EDGE runtime: this is @vercel/og's native environment. The Node
 * static-generation pass of `next build` cannot resolve next/og's internal
 * font/resvg asset URL and throws "TypeError: Invalid URL"; the edge runtime
 * resolves it correctly and renders the card on demand (cached).
 */
export const runtime = "edge";
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "radial-gradient(900px 500px at 85% -10%, rgba(124,92,252,0.35), transparent), radial-gradient(700px 420px at -5% 110%, rgba(21,184,232,0.28), transparent), #0b0f1a",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #7c5cfc, #15b8e8)",
            fontSize: 64,
            fontWeight: 800,
          }}
        >
          V
        </div>
        <div style={{ fontSize: 40, fontWeight: 600, opacity: 0.85 }}>
          {
            // i18n-exempt — brand wordmark on static social/OG card
            "Velora Civic AI"
          }
        </div>
      </div>
      <div
        style={{
          marginTop: 48,
          fontSize: 76,
          fontWeight: 800,
          lineHeight: 1.05,
          maxWidth: 1000,
        }}
      >
        {
          // i18n-exempt — brand marketing headline on static social/OG card
          "AI Civic Operations Center"
        }
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 34,
          opacity: 0.8,
          maxWidth: 960,
        }}
      >
        {
          // i18n-exempt — brand marketing tagline on static social/OG card
          "From issue reporting to issue resolution."
        }
      </div>
    </div>,
    { ...size },
  );
}
