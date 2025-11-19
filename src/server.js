// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error.message);
  console.error("Stack:", error.stack);
  // Don't exit - let the server continue running
  // Log but don't crash
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
  // Don't exit - let the server continue running
  // Log but don't crash
});

const app = require("./app");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const { initializeGoogleAnalyticsWebsocket } = require("./modules/googleAnalytics");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Start server first (don't wait for MongoDB)
// This ensures Render health checks pass even if DB is slow to connect
let server;
try {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server Running: http://localhost:${PORT}`);
    console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    try {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    } catch (logError) {
      // If logger fails, continue anyway
      console.log("Logger not available, continuing without logging");
    }
  });

  // Handle server errors
  server.on("error", (error) => {
    console.error("Server error:", error);
    // Don't exit - try to recover
  });

  try {
    initializeGoogleAnalyticsWebsocket({ server });
  } catch (error) {
    logger.error(
      JSON.stringify({
        message: "Failed to initialize Google Analytics websocket server",
        error: error.message,
      })
    );
  }
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

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
