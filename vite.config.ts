import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
    VitePWA({
      // Disable SW generation entirely — our custom sw.js in /public handles push
      // VitePWA is used here ONLY to generate the manifest.webmanifest
      registerType: "autoUpdate",
      injectRegister: null,        // Do NOT auto-register any service worker
      selfDestroying: true,        // Unregister any previously VitePWA-generated SW
      includeAssets: ["favicon.ico", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Novaes Web — Painel Administrativo",
        short_name: "Novaes Web",
        description: "Gerencie clientes, projetos, financeiro e muito mais direto do seu celular.",
        theme_color: "#6366f1",
        background_color: "#0a0a12",
        display: "standalone",
        orientation: "portrait",
        start_url: "/admin",
        scope: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Empty workbox config since we're not generating a SW
        globPatterns: [],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
