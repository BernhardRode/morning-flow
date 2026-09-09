// Runs a TypeScript script through Vite's module loader, so it resolves
// imports exactly the way the app does.
//
//   node scripts/run.mjs scripts/pose-range.ts
import { createServer } from "vite";

const [, , entry] = process.argv;
if (!entry) {
  console.error("usage: node scripts/run.mjs <script.ts>");
  process.exit(2);
}
const server = await createServer({
  server: { middlewareMode: true },
  logLevel: "error",
  configFile: "vite.config.ts",
  // No browser is coming, so don't start the dependency pre-bundler.
  optimizeDeps: { noDiscovery: true, include: [] },
});
try {
  await server.ssrLoadModule("/" + entry.replace(/^\.\//, ""));
} finally {
  await server.close();
}
