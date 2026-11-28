import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "coverage",
    "dist",
    "public",
    "vendor",
    /* The local config is gitignored */
    "src/config",
  ]),
  {
    settings: {
      react: { version: "19.3" },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          "./tsconfig.node.json",
          "./tsconfig.app.json",
          "./tsconfig.test.json",
        ],
        tsconfigRootDir: import.meta.dirname,
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
        { allowConstantExport: true },
      ],
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Please use named exports instead.",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "error",
      /* Allow vite-plugin-svgr imports e.g. "./logo.svg?react" */
      "import/no-unresolved": ["error", { ignore: ["\\?react$"] }],
      "import/exports-last": "error",
      "object-shorthand": "error",
    },
  },
  {
    // Node code: configs and tests
    files: ["*.config.ts", "**/*.test.{ts,tsx}", "src/testUtil/**"],
    languageOptions: {
      globals: globals.node,
    },
  },
  eslintConfigPrettier,
]);
