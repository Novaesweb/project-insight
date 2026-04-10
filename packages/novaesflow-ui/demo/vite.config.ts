import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@novaesflow/ui": path.resolve(__dirname, "../src/index.ts"),
      "@novaesflow/supabase-adapter": path.resolve(
        __dirname,
        "../../novaesflow-supabase-adapter/src/index.ts",
      ),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist-demo"),
    emptyOutDir: true,
  },
});
