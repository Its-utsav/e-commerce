import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";


export default defineConfig([
    { files: ["src/**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: [js.configs.recommended] },
    { files: ["src/**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
]);