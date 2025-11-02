const mongoose = require("mongoose");

// Mock email service to prevent SMTP connections during tests
jest.mock("../src/services/emailService", () => ({
  sendInquiryConfirmation: jest
    .fn()
    .mockResolvedValue({ messageId: "test-message-id" }),
  sendAdminNotification: jest
    .fn()
    .mockResolvedValue({ messageId: "test-admin-message-id" }),
}));

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.LOG_LEVEL = "error";

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterAll(async () => {
  // Clean up after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
