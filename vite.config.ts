import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: process.env.VITE_BASE_URL || "/",
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/mermaid")) return "vendor-mermaid";
          if (
            id.includes("node_modules/katex") ||
            id.includes("node_modules/cytoscape")
          ) {
            return "vendor-diagrams";
          }
          if (
            id.includes("node_modules/react-markdown") ||
            id.includes("node_modules/remark-") ||
            id.includes("node_modules/rehype-") ||
            id.includes("node_modules/highlight.js") ||
            id.includes("node_modules/lowlight")
          ) {
            return "vendor-markdown";
          }
          return undefined;
        },
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "Gestion Projet",
        short_name: "Gestion Projet",
        description:
          "Local-first project tracking: focus, board, backlog, notes and time tracking.",
        theme_color: "#4175c9",
        background_color: "#f8f5f5",
        display: "standalone",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // The mermaid vendor chunk is large but only fetched when a note
        // actually renders a diagram; raise the cap so it still precaches.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
