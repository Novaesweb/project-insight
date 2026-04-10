import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "NovaesFlowSupabaseAdapter",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["@supabase/supabase-js", "@novaesflow/ui"],
    },
  },
});
