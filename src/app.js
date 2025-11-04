const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const inquiryRoutes = require("./routes/inquiryRoutes");
const healthRoutes = require("./routes/healthRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const testWhatsappRoutes = require("./routes/testWhatsappRoutes");

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

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://tourmaline-concha-dcdeb2.netlify.app",
        "http://localhost:3000",
        "http://localhost:3001",
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
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

// Manual OPTIONS handler for additional safety
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,Accept,Origin,X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

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
