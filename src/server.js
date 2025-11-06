const app = require("./app");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required environment variables
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required");
  logger.error(JSON.stringify({ message: "MONGODB_URI environment variable is required" }));
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ DB Connected: MongoDB connection successful");
    logger.info("Connected to MongoDB successfully");

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server Running: http://localhost:${PORT}`);
      console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down gracefully");
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info("MongoDB connection closed");
          process.exit(0);
        });
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info("MongoDB connection closed");
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    console.error("❌ DB Connection Failed:", error.message);
    logger.error(JSON.stringify({ message: "MongoDB connection error", error: error.message, code: error.code }));
    process.exit(1);
  });
