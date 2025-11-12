const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],

  // Test environment
  testEnvironment: "jest-environment-jsdom",

  // Module name mapper for absolute imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/dist/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // Test match patterns
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/e2e/",
    "<rootDir>/__tests__/e2e/",
  ],

  // Transform ignore patterns for ES modules
  transformIgnorePatterns: [
    "/node_modules/(?!(next-auth|@auth|openid-client|jose|uuid|@panva)/)",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Verbose output
  verbose: true,

  // Max workers for parallel test execution
  maxWorkers: "50%",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
