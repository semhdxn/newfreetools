import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";

function noLovableGuard() {
  return {
    name: "no-lovable-guard",
    apply: "build" as const,
    buildStart() {
      try {
        execSync("node scripts/check-no-lovable.mjs", { stdio: "inherit" });
      } catch {
        throw new Error('Build aborted: user-visible "lovable" reference detected.');
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    noLovableGuard(),
    // Emit precompressed .br and .gz siblings for every text asset so the CDN
    // can serve them directly instead of compressing on the fly per request.
    compression({
      algorithms: ["brotliCompress", "gzip"],
      include: [/\.(js|mjs|css|html|json|svg|txt|xml|ico)$/],
      threshold: 1024,
      deleteOriginalAssets: false,
    }),
    // Enable with: ANALYZE=1 vite build
    process.env.ANALYZE === "1" &&
      visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Anything under 4 kB is inlined as a data URI instead of costing a request.
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Content-hashed filenames => safe to cache immutably at the edge.
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        // Split rarely-changing vendor code into its own stable chunks so a
        // normal app deploy doesn't invalidate the whole bundle in CDN caches.
        manualChunks(id) {
          // Shared runtime helpers must be pinned to their own small chunk.
          // Rollup otherwise parks them inside whichever big vendor chunk first
          // needs them — `vite/preload-helper` landed in vendor-pdf and `clsx`
          // in vendor-charts, which made the entry statically import 2.5MB of
          // otherwise-lazy PDF and chart code just to reach a few helpers.
          if (
            id.includes("vite/preload-helper") ||
            id.includes("commonjsHelpers") ||
            id.includes("/clsx/") ||
            id.includes("tailwind-merge") ||
            id.includes("class-variance-authority")
          ) {
            return "vendor-shared";
          }
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
            return "vendor-react";
          }
          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("cmdk")) {
            return "vendor-ui";
          }
          if (id.includes("@supabase") || id.includes("@tanstack")) {
            return "vendor-data";
          }
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("@react-pdf") || id.includes("react-pdf")) {
            return "vendor-pdf";
          }
          // Everything else keeps Rollup's own per-route splitting so lazy
          // routes don't get pulled into the initial download.
          return undefined;
        },
      },
    },
  },
}));
