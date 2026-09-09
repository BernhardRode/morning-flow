import { defineConfig } from "vite";

export default defineConfig({
  // Relative asset URLs, so a build can be served from any subpath
  // (GitHub Pages, a folder on a phone, file://).
  base: "./",
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
});
