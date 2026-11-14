// Vite TanStack Start configuration preset includes:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// Additional config can be passed via defineConfig({ vite: { ... }, etc... }) if needed.
import { createLogger } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The preset always installs vite-tsconfig-paths, so Vite's suggestion to switch to
// resolve.tsconfigPaths cannot be applied without breaking path resolution. Filter only that
// notice and keep every other warning.
const logger = createLogger();
const warnOnce = logger.warnOnce.bind(logger);
logger.warnOnce = (message, options) => {
  if (
    typeof message === "string" &&
    message.includes("vite-tsconfig-paths") &&
    message.includes("resolve.tsconfigPaths")
  ) {
    return;
  }
  warnOnce(message, options);
};

export default defineConfig({
  vite: {
    customLogger: logger,
    build: {
      // The 3D scenes intentionally bundle three.js and drei together: ~1.2 MB minified,
      // ~336 kB gzip. Keep the default 500 kB budget meaningful for everything else while
      // allowing this known vendor chunk.
      chunkSizeWarningLimit: 1300,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
