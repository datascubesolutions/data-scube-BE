const app = require("./app");
const mongoose = require("mongoose");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Start server first (don't wait for MongoDB)
// This ensures Render health checks pass even if DB is slow to connect
const server = app.listen(PORT, () => {
  console.log(`🚀 Server Running: http://localhost:${PORT}`);
  console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Connect to MongoDB (non-blocking)
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    })
    .then(() => {
      console.log("✅ DB Connected: MongoDB connection successful");
      logger.info("Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.error("❌ DB Connection Failed:", error.message);
      console.error("⚠️  Server will continue running but database operations will fail");
      logger.error(JSON.stringify({ 
        message: "MongoDB connection error", 
        error: error.message, 
        code: error.code 
      }));
      // Don't exit - let server run and retry connection
    });
} else {
  console.warn("⚠️  MONGODB_URI not set - database operations will fail");
  logger.warn("MONGODB_URI environment variable is not set");
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false, () => {
        logger.info("MongoDB connection closed");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(false, () => {
        logger.info("MongoDB connection closed");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
});
