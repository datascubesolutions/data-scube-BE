const express = require("express");
const inquiryController = require("../controllers/inquiryController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for inquiry creation
const createInquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 inquiry submissions per windowMs
  message: {
    success: false,
    message:
      "Too many inquiries submitted from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/", createInquiryLimiter, inquiryController.createInquiry);

// Admin routes (in production, add authentication middleware)
router.get("/", inquiryController.getInquiries);
router.get("/stats", inquiryController.getInquiryStats);
router.get("/:id", inquiryController.getInquiryById);
router.put("/:id", inquiryController.updateInquiry);
router.delete("/:id", inquiryController.deleteInquiry);

module.exports = router;
