// @ts-check

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
    { ignores: ["build/**"] },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
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
    // CommonJS Jest mocks (e.g. __mocks__/fs.js) use require/module.exports
    {
        files: ["__mocks__/**/*.js"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "writable",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    // Cypress specs rely on Chai assertions (e.g. `expect(x).to.be.true`) and
    // `any`-typed custom command declarations
    {
        files: ["cypress/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
);
