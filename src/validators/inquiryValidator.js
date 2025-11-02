const Joi = require("joi");

const createInquirySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

  company: Joi.string().trim().max(200).optional().messages({
    "string.max": "Company name cannot exceed 200 characters",
  }),

  subject: Joi.string().trim().min(5).max(200).required().messages({
    "string.empty": "Subject is required",
    "string.min": "Subject must be at least 5 characters long",
    "string.max": "Subject cannot exceed 200 characters",
  }),

  message: Joi.string().trim().min(10).max(2000).required().messages({
    "string.empty": "Message is required",
    "string.min": "Message must be at least 10 characters long",
    "string.max": "Message cannot exceed 2000 characters",
  }),

  inquiryType: Joi.string()
    .valid("general", "support", "sales", "partnership", "technical")
    .default("general"),

  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),

  source: Joi.string()
    .valid("website", "mobile-app", "api", "referral")
    .default("website"),

  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
});

const updateInquirySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "in-progress", "resolved", "closed")
    .optional(),

  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),

  assignedTo: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid user ID format",
    }),

  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),

  responseTime: Joi.date().optional(),
});

const queryInquirySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),

  status: Joi.string()
    .valid("pending", "in-progress", "resolved", "closed")
    .optional(),

  inquiryType: Joi.string()
    .valid("general", "support", "sales", "partnership", "technical")
    .optional(),

  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),

  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "priority", "status")
    .default("createdAt"),

  sortOrder: Joi.string().valid("asc", "desc").default("desc"),

  search: Joi.string().trim().max(100).optional(),

  dateFrom: Joi.date().optional(),

  dateTo: Joi.date().optional(),
});

module.exports = {
  createInquirySchema,
  updateInquirySchema,
  queryInquirySchema,
};
