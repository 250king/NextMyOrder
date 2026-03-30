import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import sortClassMembers from "eslint-plugin-sort-class-members";

const eslintConfig = defineConfig([
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", "dist/**", "src/api/generated/**"]),
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      import: importPlugin,
      "sort-class-members": sortClassMembers,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          "newlines-between": "never",
          distinctGroup: true,
        },
      ],
      "no-func-assign": "error",
      "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
      "no-var": "error",
      "@typescript-eslint/no-unused-vars": "warn",
      "sort-class-members/sort-class-members": [
        "error",
        {
          order: [
            "[static-properties]",
            "[static-methods]",
            "[properties]",
            "[conventional-private-properties]",
            "constructor",
            "[methods]",
            "[conventional-private-methods]",
          ],
          accessorPairPositioning: "getThenSet",
        },
      ],
    },
  },
  prettierConfig,
]);

export default eslintConfig;
