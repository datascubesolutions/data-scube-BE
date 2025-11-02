const {
  createInquirySchema,
} = require("../../src/validators/inquiryValidator");

describe("Inquiry Validator - Unit Tests", () => {
  describe("createInquirySchema", () => {
    it("should validate correct inquiry data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to pass validation.",
        inquiryType: "general",
        priority: "medium",
      };

      const { error } = createInquirySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        subject: "Test Subject",
        message:
          "This is a test message that is long enough to pass validation.",
        inquiryType: "general",
        priority: "medium",
      };

      const { error } = createInquirySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("email");
    });

    it("should reject short message", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Short",
        inquiryType: "general",
        priority: "medium",
      };

      const { error } = createInquirySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain("message");
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        email: "john@example.com",
        // missing name, subject, message
      };

      const { error } = createInquirySchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
