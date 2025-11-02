// Test setup file
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.MONGODB_URI = "mongodb://localhost:27017/datascube_test";

// Suppress console logs during tests
if (process.env.NODE_ENV === "test") {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}
