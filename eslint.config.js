// ESLint v9 flat config (CommonJS)
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const prettier = require("eslint-plugin-prettier");
const playwright = require("eslint-plugin-playwright");
const eslintConfigPrettier = require("eslint-config-prettier");

const playwrightRecommended = playwright.configs["flat/recommended"];
const tsRecommendedRules = tseslint.configs?.recommended?.rules ?? {};

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "**/*.png",
      "report/**",
    ],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: importPlugin,
      prettier,
    },
    rules: {
      ...tsRecommendedRules,
      "prettier/prettier": "warn",
      "no-console": "off",
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ...playwrightRecommended,
    files: ["tests/**"],
    rules: {
      ...playwrightRecommended.rules,
      // Allow defensive conditionals inside tests in this project
      "playwright/no-conditional-in-test": "off",
    },
  },
  eslintConfigPrettier,
];
