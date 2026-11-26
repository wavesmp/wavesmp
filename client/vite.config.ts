/// <reference types="vitest/config" />

import path from "node:path";

import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

import { buildConstants } from "./buildConstants.ts";

const srcDir = path.join(import.meta.dirname, "src");

/*
 * Replaces the keys in buildConstants.ts with their values in source
 * TS and CSS files. Tests are skipped, since they may define the keys as
 * globals. The keys used as identifiers are declared in
 * src/buildConstants.d.ts. Longer keys are replaced first, so a key that is a
 * prefix of another key does not clobber it.
 */
function buildConstantsPlugin(): Plugin {
  const replacements = Object.entries(buildConstants)
    .sort(([a], [b]) => b.length - a.length)
    .map(([key, val]): [RegExp, string] => [new RegExp(key, "g"), val]);
  return {
    name: "waves-build-constants",
    enforce: "pre",
    transform(code, id): { code: string; map: null } | null {
      const file = id.split("?", 1)[0] ?? id;
      if (
        !file.startsWith(srcDir) ||
        !/\.(tsx?|css)$/.test(file) ||
        /\.test\.tsx?$/.test(file)
      ) {
        return null;
      }
      let result = code;
      for (const [re, val] of replacements) {
        result = result.replace(re, val);
      }
      return { code: result, map: null };
    },
  };
}

// https://vite.dev/config/
// eslint-disable-next-line no-restricted-syntax
export default defineConfig({
  plugins: [buildConstantsPlugin(), react(), svgr()],
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
