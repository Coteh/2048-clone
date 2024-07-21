/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
export default {
  coverageProvider: "v8",
  reporters: [
    "default", 
    [ 
      "jest-junit", 
      { 
        outputFile: "./results/unit-test-results.xml"
      }
    ]
  ],
  testMatch: [
    "**/test/**/*.[jt]s?(x)",
  ],
  transform: {},
};
