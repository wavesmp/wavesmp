import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

import { buildConstants } from "./buildConstants.js";

// eslint-disable-next-line no-restricted-syntax
export default defineConfig([
  globalIgnores(["coverage", "dist", "public", "vendor", "src/config"]),
  {
    settings: {
      react: { version: "16.14" },
      "import/resolver": {
        typescript: true,
        // Resolve the "src/..." alias (see vite.config.js)
        node: {
          paths: [import.meta.dirname],
          extensions: [".js", ".jsx", ".json"],
        },
      },
    },
    extends: [js.configs.recommended, importPlugin.flatConfigs.recommended],
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      // jettison-ui uses 2020, but class fields require ES2022
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        // Globals loaded by script tags in index.html
        AWS: "readonly",
        google: "readonly",
        // Constants substituted at build time (see vite.config.js)
        ...Object.fromEntries(
          Object.keys(buildConstants).map((c) => [c, "readonly"]),
        ),
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        // Unlike jettison-ui, react-redux connect() wraps exported components
        { allowConstantExport: true, extraHOCs: ["connect"] },
      ],
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      // Avoid prop types for now. May want to look into TypeScript instead
      "react/prop-types": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Please use named exports instead.",
        },
      ],
      "import/no-unresolved": ["error", { ignore: ["\\?react$"] }],
      "import/exports-last": "error",
      "object-shorthand": "error",
    },
  },
  {
    // Node code: configs and tests
    files: ["*.config.js", "**/*.test.js", "src/testUtil/**"],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
]);
