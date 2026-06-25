import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // firebase-admin is a server-only package; keep it external to the
  // server bundle so its native/optional deps are not bundled by webpack.
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  // These voice-recorder packages are ESM-only. Transpiling them through Next
  // keeps their modern ESM output compatible with the server bundle. They are
  // only used by a client-only (`ssr: false`) field.
  transpilePackages: ["react-audio-voice-recorder", "react-audio-visualize"],
  webpack: (config) => {
    // `react-audio-voice-recorder` ships an `exports` map that only declares
    // an `import` (and `types`) condition — no `require`/`default`. Next's
    // server-side webpack pass cannot resolve the bare specifier and fails the
    // build with "Package path . is not exported". Alias the bare specifier
    // directly to its concrete ESM bundle to bypass exports-field resolution.
    // (`react-audio-visualize` resolves fine — its exports map has both
    // `import` and `require` — so it needs no alias.)
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-audio-voice-recorder$": path.resolve(
        process.cwd(),
        "node_modules/react-audio-voice-recorder/dist/react-audio-voice-recorder.es.js",
      ),
    };
    return config;
  },
};

export default nextConfig;
