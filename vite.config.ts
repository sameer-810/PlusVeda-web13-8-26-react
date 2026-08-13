import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // The page is one route with no code-splitting to do. A single chunk beats
    // a chunk graph here: fewer round trips before the hero paints.
    chunkSizeWarningLimit: 700,
  },
});
