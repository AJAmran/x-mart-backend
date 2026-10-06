import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      // Use the TypeScript-aware rule instead of the base one. Running both
      // means the base rule reports identifiers that only appear in a type
      // position — e.g. `(c: Check) => boolean` inside Array<[...]> — as unused
      // variables, which is a false positive, not a finding.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "error",
      "prefer-const": "error",
      "no-console": "warn",
    },
  },
  {
    // docker/mongo-init.js is a Mongo shell script, not Node: `db` and `print`
    // are provided by mongosh at runtime.
    ignores: ["**/node_modules/", "**/dist/", "docker/"],
  }
);
