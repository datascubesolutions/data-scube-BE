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

// CORS must be applied before other middleware for preflight requests
// But we'll apply it after helmet with proper configuration

// Security middleware - Configured to work with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // Allow embedding
    referrerPolicy: { policy: "no-referrer-when-downgrade" }, // Less strict for CORS
    contentSecurityPolicy: false, // Disable CSP to avoid CORS conflicts
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "https://data-scube-solutions.vercel.app",
    ];

// CORS configuration function
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Always allow Vercel deployments (production and preview)
    if (origin.includes(".vercel.app")) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In production, if ALLOWED_ORIGINS is explicitly set, reject unknown origins
    if (process.env.NODE_ENV === "production" && process.env.ALLOWED_ORIGINS) {
      return callback(new Error("Not allowed by CORS"));
    }

    // Otherwise allow (for development or when ALLOWED_ORIGINS is not set)
    return callback(null, true);
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
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours - cache preflight requests
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly for all routes
app.options("*", cors(corsOptions));

// Manual CORS headers middleware to ensure headers are always set
// This runs after cors() middleware as a backup to ensure headers are present
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin should be allowed (same logic as corsOptions)
  let allowOrigin = false;
  if (!origin) {
    allowOrigin = true; // Allow requests with no origin
  } else if (origin.includes(".vercel.app")) {
    allowOrigin = true; // Always allow Vercel
  } else if (allowedOrigins.includes(origin)) {
    allowOrigin = true; // Allow if in allowed list
  } else if (process.env.NODE_ENV !== "production" || !process.env.ALLOWED_ORIGINS) {
    allowOrigin = true; // Allow in dev or if ALLOWED_ORIGINS not set
  }
  
  // Set CORS headers if origin is allowed
  if (allowOrigin) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, Origin, X-Requested-With, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, User-Agent, Referer"
    );
    res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  
  next();
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
