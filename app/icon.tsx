import { ImageResponse } from "next/og";

/**
 * Generated app icon / favicon (App Router convention). A gradient civic-pulse
 * tile — no static asset or external font needed.
 *
 * Runs on the EDGE runtime: this is @vercel/og's native environment. The Node
 * static-generation pass of `next build` cannot resolve next/og's internal
 * font/resvg asset URL and throws "TypeError: Invalid URL"; the edge runtime
 * resolves it correctly and renders the image on demand (cached).
 */
export const runtime = "edge";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #7c5cfc 0%, #9b6cf6 55%, #15b8e8 100%)",
        color: "white",
        fontSize: 300,
        fontWeight: 700,
        borderRadius: 96,
      }}
    >
      V
    </div>,
    { ...size },
  );
}
