const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Health check endpoint
// Always returns 200 to prevent Render from killing the service
// Database status is included but doesn't affect HTTP status
router.get("/", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      memory: {
        used:
          Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
          100,
        total:
          Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
          100,
        external:
          Math.round((process.memoryUsage().external / 1024 / 1024) * 100) /
          100,
      },
    },
  };

  // Always return 200 - let the service start even if DB is not connected yet
  // The /ready endpoint can be used for readiness checks
  res.status(200).json({
    success: true,
    data: healthCheck,
  });
});

// Readiness probe
router.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    message: isReady ? "Service is ready" : "Service is not ready",
    timestamp: new Date().toISOString(),
  });
});

// Liveness probe
router.get("/live", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is alive",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
