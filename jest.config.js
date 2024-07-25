/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    coverageProvider: "v8",
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputFile: "./results/unit-test-results.xml",
            },
        ],
    ],
    testMatch: ["**/test/**/*.[jt]s?(x)"],
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
};
