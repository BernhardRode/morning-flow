import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Relative asset URLs, so a build can be served from any subpath
  // (GitHub Pages project sites, a folder on a phone, file://).
  base: "./",
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Morgen-Flow",
        short_name: "Flow",
        description: "Angeleitete Morgenroutine mit getaktetem Zählen und Sprachansagen.",
        lang: "de",
        theme_color: "#0B1620",
        background_color: "#0B1620",
        display: "standalone",
        orientation: "portrait",
        // Relative to the manifest, so the app installs correctly from a subpath.
        start_url: "./",
        scope: "./",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Everything the app needs, fonts and the three.js chunk included, so
        // the first offline run is complete rather than half-drawn.
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
