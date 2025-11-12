const express = require("express");
const meetingController = require("../controllers/meetingController");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for booking endpoints
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 booking requests per windowMs
  message: {
    success: false,
    message: "Too many booking attempts, please try again later.",
  },
});

// Public routes

// Get supported timezones
// GET /api/meetings/timezones
router.get("/timezones", meetingController.getSupportedTimezones);

// Get available slots for a date
// GET /api/meetings/slots?date=2024-11-05&timezone=America/New_York
router.get("/slots", meetingController.getAvailableSlots);

// Book a meeting slot
// POST /api/meetings/book
router.post("/book", bookingLimiter, meetingController.bookMeetingSlot);

// Get booking by reference or ID
// GET /api/meetings/booking/MTG-ABC123 or /api/meetings/booking/64f8a1b2c3d4e5f6a7b8c9d0
router.get("/booking/:id", meetingController.getBookingById);

// Cancel booking
// PUT /api/meetings/booking/64f8a1b2c3d4e5f6a7b8c9d0/cancel
router.put("/booking/:id/cancel", meetingController.cancelBooking);

// Get customer's bookings by email
// GET /api/meetings/customer/john@example.com/bookings
router.get("/customer/:email/bookings", meetingController.getCustomerBookings);

// Admin routes (you might want to add authentication middleware here)

// Get all bookings with filters
// GET /api/meetings/bookings?page=1&limit=10&status=confirmed&date=2024-11-05
router.get("/bookings", meetingController.getBookings);

// Update booking
// PUT /api/meetings/booking/64f8a1b2c3d4e5f6a7b8c9d0
router.put("/booking/:id", meetingController.updateBooking);

// Get booking statistics
// GET /api/meetings/stats
router.get("/stats", meetingController.getBookingStats);

module.exports = router;
