const winston = require("winston");
const path = require("path");

// Create logs directory if it doesn't exist (with error handling)
const fs = require("fs");
const logsDir = path.join(process.cwd(), "logs");
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (error) {
  // If we can't create logs directory, continue without file logging
  console.warn("Warning: Could not create logs directory:", error.message);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance with error handling
let transports = [];

// Only add file transports if logs directory exists and is writable
try {
  if (fs.existsSync(logsDir) && fs.statSync(logsDir).isDirectory()) {
    transports = [
      // Write all logs with level 'error' and below to error.log
      new winston.transports.File({
        filename: path.join(logsDir, "error.log"),
        level: "error",
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Write all logs with level 'info' and below to combined.log
      new winston.transports.File({
        filename: path.join(logsDir, "combined.log"),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ];
  }
} catch (error) {
  console.warn("Warning: Could not set up file logging:", error.message);
}

// Always add console transport for immediate visibility
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "datascube-api" },
  transports: [...transports, consoleTransport], // Always include console
});

module.exports = logger;
