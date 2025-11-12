const meetingService = require("../services/meetingService");
const logger = require("../utils/logger");
const {
  createBookingSchema,
  updateBookingSchema,
  getSlotsSchema,
  getBookingsSchema,
} = require("../validators/meetingValidator");

class MeetingController {
  // Get available slots for a date
  async getAvailableSlots(req, res, next) {
    try {
      // Validate query parameters
      const { error, value } = getSlotsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const { date, timezone } = value;
      const slots = await meetingService.getAvailableSlots(date, timezone);

      res.json({
        success: true,
        message: "Available slots retrieved successfully",
        data: {
          date: new Date(date).toISOString().split("T")[0],
          timezone: timezone || "Asia/Kolkata",
          slots: slots,
          totalSlots: slots.length,
          availableSlots: slots.filter((slot) => !slot.isBooked).length,
          bookedSlots: slots.filter((slot) => slot.isBooked).length,
        },
      });
    } catch (error) {
      logger.error("Error getting available slots:", error);
      next(error);
    }
  }

  // Book a meeting slot
  async bookMeetingSlot(req, res, next) {
    try {
      // Validate request body
      const { error, value } = createBookingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Add client information
      const clientInfo = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      };

      const booking = await meetingService.bookMeetingSlot(value, clientInfo);

      res.status(201).json({
        success: true,
        message: "Meeting booked successfully",
        data: {
          bookingReference: booking.bookingReference,
          status: booking.status,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          date: booking.slotId.date.toDateString(),
          timeRange: booking.slotId.timeRange,
          meetingPurpose: booking.meetingPurpose,
          createdAt: booking.createdAt,
        },
      });
    } catch (error) {
      logger.error("Error booking meeting slot:", error);

      // Handle specific booking errors
      if (
        error.message.includes("already booked") ||
        error.message.includes("not found") ||
        error.message.includes("not active") ||
        error.message.includes("already have a booking")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next(error);
    }
  }

  // Get all bookings with filters
  async getBookings(req, res, next) {
    try {
      // Validate query parameters
      const { error, value } = getBookingsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const result = await meetingService.getBookings(value);

      res.json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result.bookings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Error getting bookings:", error);
      next(error);
    }
  }

  // Get booking by ID or reference
  async getBookingById(req, res, next) {
    try {
      const { id } = req.params;

      // Try to find by ID first, then by booking reference
      let booking = await meetingService.getBookings({
        bookingReference: id.toUpperCase(),
      });

      if (!booking.bookings.length) {
        // Try by MongoDB ID
        booking = await meetingService.getBookings({ _id: id });
      }

      if (!booking.bookings.length) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      res.json({
        success: true,
        message: "Booking retrieved successfully",
        data: booking.bookings[0],
      });
    } catch (error) {
      logger.error("Error getting booking:", error);
      next(error);
    }
  }

  // Update booking
  async updateBooking(req, res, next) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateBookingSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const booking = await meetingService.updateBooking(id, value);

      res.json({
        success: true,
        message: "Booking updated successfully",
        data: booking,
      });
    } catch (error) {
      logger.error("Error updating booking:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      next(error);
    }
  }

  // Cancel booking
  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await meetingService.cancelBooking(id, reason);

      res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      logger.error("Error cancelling booking:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      next(error);
    }
  }

  // Get booking statistics
  async getBookingStats(req, res, next) {
    try {
      const stats = await meetingService.getBookingStats();

      res.json({
        success: true,
        message: "Booking statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      logger.error("Error getting booking stats:", error);
      next(error);
    }
  }

  // Get supported timezones
  async getSupportedTimezones(req, res, next) {
    try {
      const timezones = meetingService.getSupportedTimezones();

      res.json({
        success: true,
        message: "Supported timezones retrieved successfully",
        data: {
          timezones: timezones,
          default: "Asia/Kolkata",
        },
      });
    } catch (error) {
      logger.error("Error getting supported timezones:", error);
      next(error);
    }
  }

  // Get customer's bookings
  async getCustomerBookings(req, res, next) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Customer email is required",
        });
      }

      const result = await meetingService.getBookings({
        customerEmail: email.toLowerCase(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      res.json({
        success: true,
        message: "Customer bookings retrieved successfully",
        data: result.bookings,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error("Error getting customer bookings:", error);
      next(error);
    }
  }
}

module.exports = new MeetingController();
