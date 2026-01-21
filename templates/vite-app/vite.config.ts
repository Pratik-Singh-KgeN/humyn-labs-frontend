import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@humyn/ui/dist": path.resolve(__dirname, "../../packages/ui/dist"),
      "@humyn/ui/lib": path.resolve(__dirname, "../../packages/ui/src/lib"),
      "@humyn/ui": path.resolve(__dirname, "../../packages/ui/src/components"),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [
          path.resolve(__dirname, "../../"),
          path.resolve(__dirname, "../../packages/ui"),
        ],
      },
    },
  },
});
