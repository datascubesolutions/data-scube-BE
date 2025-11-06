const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error (detailed for server logs)
  logger.error(JSON.stringify({
    message: `Error: ${err.message}`,
    name: err.name,
    code: err.code,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  }));

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Invalid resource ID format";
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "This record already exists";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = errors.length === 1 ? errors[0] : "Validation failed";
    error = { message, statusCode: 400, errors };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid authentication token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Your session has expired. Please login again";
    error = { message, statusCode: 401 };
  }

  // Rate limit error
  if (err.status === 429 || err.statusCode === 429) {
    const message = "Too many requests. Please try again later";
    error = { message, statusCode: 429 };
  }

  // CORS error
  if (err.message && err.message.includes("CORS")) {
    const message = "Request not allowed from this origin";
    error = { message, statusCode: 403 };
  }

  // Default error message for 500 errors
  const isDevelopment = process.env.NODE_ENV === "development";
  const statusCode = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred. Please try again later.";

  // Build response
  const response = {
    success: false,
    message: message,
  };

  // Add errors array if validation errors exist
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors;
  }

  // Only include stack trace in development
  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  // Don't expose internal error details in production
  if (!isDevelopment && statusCode === 500) {
    response.message = "An unexpected error occurred. Please try again later.";
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
