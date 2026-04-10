import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "packages/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@novaesflow/ui": path.resolve(__dirname, "./packages/novaesflow-ui/src/index.ts"),
      "@novaesflow/supabase-adapter": path.resolve(
        __dirname,
        "./packages/novaesflow-supabase-adapter/src/index.ts",
      ),
    },
  },
});
