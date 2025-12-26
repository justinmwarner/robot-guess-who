import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import path from "path";

export default defineConfig({
  base: '/robot-guess-who/',
  plugins: [
    react(),
    ViteImageOptimizer({
      png: {
        quality: 80,
        compressionLevel: 9,
      },
      jpeg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./postcss.config.cjs",
  },
});

