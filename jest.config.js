module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
};
