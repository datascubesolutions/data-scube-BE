const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables (prefer .env.local, fallback to .env)
const ENV_FILES = [".env.local", ".env"];
const appRoot = path.resolve(__dirname, "..");
const envFilePath = ENV_FILES.map((file) => path.join(appRoot, file)).find((filePath) =>
  fs.existsSync(filePath)
);

if (envFilePath) {
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

// Import routes
const inquiryRoutes = require("./routes/inquiryRoutes");
const healthRoutes = require("./routes/healthRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const testWhatsappRoutes = require("./routes/testWhatsappRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration - Allow all origins for now
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
      "User-Agent",
      "Referer",
    ],
    exposedHeaders: ["Content-Length"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Compression and logging
app.use(compression());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/test-whatsapp", testWhatsappRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/upload", uploadRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler - must be last
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
