/// <reference types="vitest/config" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  // Configure the dev server
  // See nginx for the prod server
  // For options, see: https://vite.dev/config/server-options
  server: {
    // Default dev port is 5173. Make it strict to avoid trying other ports
    strictPort: true,
  },
  // For options, see: https://vite.dev/config/preview-options
  preview: {
    // Default preview port is 4173. Make it strict to avoid trying other ports
    strictPort: true,
  },
  // For options, see: https://vitest.dev/config/
  test: {
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
