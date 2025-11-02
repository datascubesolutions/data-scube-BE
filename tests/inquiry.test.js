const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const Inquiry = require("../src/models/Inquiry");

// Test database
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/datascube_test";

describe("Inquiry API", () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await Inquiry.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/inquiries", () => {
    const validInquiry = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      company: "Test Company",
      subject: "Test Inquiry Subject",
      message: "This is a test inquiry message with sufficient length.",
      inquiryType: "general",
      priority: "medium",
    };

    it("should create a new inquiry with valid data", async () => {
      const response = await request(app)
        .post("/api/inquiries")
        .send(validInquiry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Inquiry submitted successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.status).toBe("pending");

      // Verify inquiry was saved to database
      const savedInquiry = await Inquiry.findById(response.body.data.id);
      expect(savedInquiry).toBeTruthy();
      expect(savedInquiry.name).toBe(validInquiry.name);
      expect(savedInquiry.email).toBe(validInquiry.email);
    });

    it("should return validation error for missing required fields", async () => {
      const invalidInquiry = {
        name: "John Doe",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/inquiries")
        .send(invalidInquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it("should return validation error for invalid email", async () => {
      const invalidInquiry = {
        ...validInquiry,
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/inquiries")
        .send(invalidInquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain(
        "Please provide a valid email address"
      );
    });

    it("should return validation error for short message", async () => {
      const invalidInquiry = {
        ...validInquiry,
        message: "Short",
      };

      const response = await request(app)
        .post("/api/inquiries")
        .send(invalidInquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/inquiries", () => {
    beforeEach(async () => {
      // Create test inquiries
      await Inquiry.create([
        {
          name: "John Doe",
          email: "john@example.com",
          subject: "Test Subject 1",
          message: "Test message 1 with sufficient length for validation.",
          inquiryType: "general",
          status: "pending",
        },
        {
          name: "Jane Smith",
          email: "jane@example.com",
          subject: "Test Subject 2",
          message: "Test message 2 with sufficient length for validation.",
          inquiryType: "support",
          status: "resolved",
        },
      ]);
    });

    it("should return all inquiries with pagination", async () => {
      const response = await request(app).get("/api/inquiries").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toHaveProperty("currentPage");
      expect(response.body.pagination).toHaveProperty("totalPages");
      expect(response.body.pagination).toHaveProperty("totalItems");
    });

    it("should filter inquiries by status", async () => {
      const response = await request(app)
        .get("/api/inquiries?status=pending")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].status).toBe("pending");
    });

    it("should filter inquiries by inquiry type", async () => {
      const response = await request(app)
        .get("/api/inquiries?inquiryType=support")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].inquiryType).toBe("support");
    });

    it("should search inquiries by name", async () => {
      const response = await request(app)
        .get("/api/inquiries?search=John")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toContain("John");
    });
  });

  describe("GET /api/inquiries/:id", () => {
    let inquiryId;

    beforeEach(async () => {
      const inquiry = await Inquiry.create({
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message with sufficient length for validation.",
        inquiryType: "general",
      });
      inquiryId = inquiry._id;
    });

    it("should return inquiry by ID", async () => {
      const response = await request(app)
        .get(`/api/inquiries/${inquiryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(inquiryId.toString());
      expect(response.body.data.name).toBe("John Doe");
    });

    it("should return 404 for non-existent inquiry", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/inquiries/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Inquiry not found");
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/inquiries/invalid-id")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/inquiries/:id", () => {
    let inquiryId;

    beforeEach(async () => {
      const inquiry = await Inquiry.create({
        name: "John Doe",
        email: "john@example.com",
        subject: "Test Subject",
        message: "Test message with sufficient length for validation.",
        inquiryType: "general",
        status: "pending",
      });
      inquiryId = inquiry._id;
    });

    it("should update inquiry status", async () => {
      const updateData = { status: "resolved" };

      const response = await request(app)
        .put(`/api/inquiries/${inquiryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("resolved");
      expect(response.body.data.resolvedAt).toBeTruthy();
    });

    it("should update inquiry priority", async () => {
      const updateData = { priority: "high" };

      const response = await request(app)
        .put(`/api/inquiries/${inquiryId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe("high");
    });

    it("should return 404 for non-existent inquiry", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { status: "resolved" };

      const response = await request(app)
        .put(`/api/inquiries/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Inquiry not found");
    });
  });

  describe("GET /api/inquiries/stats", () => {
    beforeEach(async () => {
      await Inquiry.create([
        {
          name: "User 1",
          email: "user1@example.com",
          subject: "Subject 1",
          message: "Message 1 with sufficient length for validation.",
          inquiryType: "general",
          status: "pending",
          priority: "low",
        },
        {
          name: "User 2",
          email: "user2@example.com",
          subject: "Subject 2",
          message: "Message 2 with sufficient length for validation.",
          inquiryType: "support",
          status: "resolved",
          priority: "high",
        },
      ]);
    });

    it("should return inquiry statistics", async () => {
      const response = await request(app)
        .get("/api/inquiries/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("overview");
      expect(response.body.data).toHaveProperty("byType");
      expect(response.body.data).toHaveProperty("byPriority");
      expect(response.body.data.overview.total).toBe(2);
      expect(response.body.data.overview.pending).toBe(1);
      expect(response.body.data.overview.resolved).toBe(1);
    });
  });
});
