import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Separate checkout with its own dependencies and generated output.
    ".claude/worktrees/**",
    // Unmodified third-party Draco runtime; notices are shipped beside it.
    "public/anatomy/3d/draco/*.js",
  ]),
]);

export default eslintConfig;
