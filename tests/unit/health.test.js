const request = require("supertest");
const app = require("../../src/app");

describe("Health Check API - Unit Tests", () => {
  describe("GET /api/health/live", () => {
    it("should return liveness status", async () => {
      const response = await request(app).get("/api/health/live").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Service is alive");
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/health/ready", () => {
    it("should return readiness status", async () => {
      const response = await request(app).get("/api/health/ready");

      expect(response.body).toHaveProperty("success");
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
