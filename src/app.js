const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes (with error handling)
let inquiryRoutes, healthRoutes, whatsappRoutes, testWhatsappRoutes, errorHandler, logger;

try {
  inquiryRoutes = require("./routes/inquiryRoutes");
  healthRoutes = require("./routes/healthRoutes");
  whatsappRoutes = require("./routes/whatsappRoutes");
  testWhatsappRoutes = require("./routes/testWhatsappRoutes");
  errorHandler = require("./middleware/errorHandler");
  logger = require("./utils/logger");
} catch (error) {
  console.error("Failed to load routes or middleware:", error);
  // Use basic error handler if custom one fails
  errorHandler = (err, req, res, _next) => {
    res.status(500).json({ success: false, message: "Internal server error" });
  };
  logger = { info: console.log, error: console.error, warn: console.warn };
}

const app = express();

// CORS configuration - MUST be applied FIRST, before any other middleware
// This ensures preflight OPTIONS requests are handled correctly
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
  ],
  exposedHeaders: ["Content-Length", "Content-Type"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours - cache preflight requests
};

// Apply CORS FIRST - before any other middleware
app.use(cors(corsOptions));

// Security middleware - Configured to work with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // Allow embedding
    referrerPolicy: { policy: "no-referrer-when-downgrade" }, // Less strict for CORS
    contentSecurityPolicy: false, // Disable CSP to avoid CORS conflicts
  })
);

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

// Compression
app.use(compression());

// Body parsing middleware (must be before morgan to log request bodies)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Request Logging with Morgan
// Custom format for better API logging
morgan.token("body", (req) => {
  // Only log body for POST/PUT/PATCH requests, and exclude sensitive data
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    try {
      const body = { ...req.body };
      // Remove sensitive fields from logs
      if (body.password) body.password = "[REDACTED]";
      if (body.token) body.token = "[REDACTED]";
      if (body.SMTP_PASS) body.SMTP_PASS = "[REDACTED]";
      if (body.pass) body.pass = "[REDACTED]";
      const bodyStr = JSON.stringify(body);
      // Truncate very long bodies
      return bodyStr.length > 500 ? bodyStr.substring(0, 500) + "..." : bodyStr;
    } catch (error) {
      return "[Unable to parse body]";
    }
  }
  return "-";
});

morgan.token("response-time-ms", (req, res) => {
  return res["response-time"] ? `${Math.round(res["response-time"])}ms` : "-";
});

// Custom format for API logging
const apiLogFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time-ms :res[content-length] ":referrer" ":user-agent"';

// Log all API requests
app.use(
  morgan(apiLogFormat, {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
    skip: (req, res) => {
      // Skip logging for health checks in production (reduce noise)
      return (
        process.env.NODE_ENV === "production" &&
        req.path === "/api/health" &&
        res.statusCode === 200
      );
    },
  })
);

// Detailed logging for API endpoints (with request body for POST/PUT/PATCH)
if (process.env.NODE_ENV !== "production") {
  app.use(
    morgan(":method :url :status :response-time-ms - Body: :body", {
      stream: {
        write: (message) => {
          logger.info(message.trim());
        },
      },
      skip: (req) => req.method === "GET" || req.path === "/api/health",
    })
  );
}

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
