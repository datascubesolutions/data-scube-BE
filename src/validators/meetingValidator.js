const Joi = require("joi");

const createBookingSchema = Joi.object({
  slotId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid slot ID format",
      "string.empty": "Slot ID is required",
    }),

  customerName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Customer name is required",
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
  }),

  customerEmail: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
  }),

  customerPhone: Joi.string()
    .trim()
    .pattern(/^[+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Please provide a valid phone number",
    }),

  customerCompany: Joi.string().trim().max(200).optional().messages({
    "string.max": "Company name cannot exceed 200 characters",
  }),

  meetingPurpose: Joi.string()
    .valid(
      "product-demo",
      "consultation",
      "support",
      "sales-discussion",
      "partnership",
      "technical-discussion",
      "other"
    )
    .default("consultation"),

  meetingDescription: Joi.string().trim().max(500).optional().messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  customerTimezone: Joi.string()
    .valid(
      "Asia/Kolkata",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "America/Denver",
      "America/Phoenix",
      "Europe/London",
      "Europe/Paris",
      "Australia/Sydney"
    )
    .default("Asia/Kolkata")
    .messages({
      "any.only": "Invalid timezone",
    }),
});

const updateBookingSchema = Joi.object({
  status: Joi.string()
    .valid("confirmed", "pending", "cancelled", "completed", "no-show")
    .optional(),

  meetingLink: Joi.string().uri().optional().messages({
    "string.uri": "Please provide a valid meeting link",
  }),

  notes: Joi.string().trim().max(1000).optional().messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
});

const getSlotsSchema = Joi.object({
  date: Joi.date().min("now").required().messages({
    "date.min": "Date cannot be in the past",
    "any.required": "Date is required",
  }),
  timezone: Joi.string()
    .valid(
      "Asia/Kolkata",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
      "America/Denver",
      "America/Phoenix",
      "Europe/London",
      "Europe/Paris",
      "Australia/Sydney"
    )
    .default("Asia/Kolkata"),
});

const getBookingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid("confirmed", "pending", "cancelled", "completed", "no-show")
    .optional(),
  date: Joi.date().optional(),
  customerEmail: Joi.string().email().optional(),
  sortBy: Joi.string()
    .valid("createdAt", "updatedAt", "status")
    .default("createdAt"),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
});

module.exports = {
  createBookingSchema,
  updateBookingSchema,
  getSlotsSchema,
  getBookingsSchema,
};
