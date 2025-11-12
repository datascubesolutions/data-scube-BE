const MeetingSlot = require("../models/MeetingSlot");
const MeetingBooking = require("../models/MeetingBooking");
const emailService = require("./emailService");
const whatsappService = require("./whatsappService");
const logger = require("../utils/logger");
const {
  convertSlotToTimezone,
  getSupportedTimezones,
} = require("../utils/timezoneHelper");

class MeetingService {
  // Get available slots for a specific date
  async getAvailableSlots(date, customerTimezone = "Asia/Kolkata") {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Ensure slots exist for the date
      await MeetingSlot.createDefaultSlotsForDate(targetDate, customerTimezone);

      // Get all slots for the date
      const slots = await MeetingSlot.find({
        date: targetDate,
        isActive: true,
      }).sort({ slotNumber: 1 });

      // Get bookings for these slots
      const slotIds = slots.map((slot) => slot._id);
      const bookings = await MeetingBooking.find({
        slotId: { $in: slotIds },
        status: { $in: ["confirmed", "pending"] },
      });

      // Create booking count map
      const bookingCounts = {};
      bookings.forEach((booking) => {
        const slotId = booking.slotId.toString();
        bookingCounts[slotId] = (bookingCounts[slotId] || 0) + 1;
      });

      // Add booking status to slots and convert to customer timezone
      const slotsWithStatus = slots.map((slot) => {
        const slotId = slot._id.toString();
        const bookingCount = bookingCounts[slotId] || 0;
        const isBooked = bookingCount >= slot.maxBookings;

        const slotData = {
          _id: slot._id,
          date: slot.date,
          slotNumber: slot.slotNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
          timeRange: slot.timeRange,
          isBooked: isBooked,
          availableSpots: slot.maxBookings - bookingCount,
          totalSpots: slot.maxBookings,
        };

        // Convert to customer's timezone if different
        if (customerTimezone && customerTimezone !== slot.timezone) {
          return convertSlotToTimezone(slotData, customerTimezone);
        }

        return slotData;
      });

      return slotsWithStatus;
    } catch (error) {
      logger.error("Error getting available slots:", error);
      throw error;
    }
  }

  // Get supported timezones
  getSupportedTimezones() {
    return getSupportedTimezones();
  }

  // Book a meeting slot
  async bookMeetingSlot(bookingData, clientInfo = {}) {
    try {
      // Check if slot exists and is available
      const slot = await MeetingSlot.findById(bookingData.slotId);
      if (!slot) {
        throw new Error("Meeting slot not found");
      }

      if (!slot.isActive) {
        throw new Error("Meeting slot is not active");
      }

      // Check if slot is already fully booked
      const existingBookings = await MeetingBooking.countDocuments({
        slotId: bookingData.slotId,
        status: { $in: ["confirmed", "pending"] },
      });

      if (existingBookings >= slot.maxBookings) {
        throw new Error("Meeting slot is already fully booked");
      }

      // Check if customer already has a booking for this slot
      const existingCustomerBooking = await MeetingBooking.findOne({
        slotId: bookingData.slotId,
        customerEmail: bookingData.customerEmail,
        status: { $in: ["confirmed", "pending"] },
      });

      if (existingCustomerBooking) {
        throw new Error("You already have a booking for this slot");
      }

      // Create the booking
      const booking = new MeetingBooking({
        ...bookingData,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      });

      await booking.save();

      // Populate slot information
      await booking.populate("slotId");

      // Send confirmation email
      setImmediate(async () => {
        try {
          await this.sendBookingConfirmation(booking);
          logger.info(
            `Booking confirmation sent for ${booking.bookingReference}`
          );
        } catch (emailError) {
          logger.error(`Failed to send booking confirmation:`, emailError);
        }
      });

      // Send WhatsApp confirmation (if phone provided)
      setImmediate(async () => {
        try {
          await this.sendWhatsAppConfirmation(booking);
          logger.info(
            `WhatsApp confirmation sent for ${booking.bookingReference}`
          );
        } catch (whatsappError) {
          logger.error(`Failed to send WhatsApp confirmation:`, whatsappError);
        }
      });

      // Send admin notification
      setImmediate(async () => {
        try {
          await this.sendAdminNotification(booking);
          logger.info(
            `Admin notification sent for ${booking.bookingReference}`
          );
        } catch (adminError) {
          logger.error(`Failed to send admin notification:`, adminError);
        }
      });

      return booking;
    } catch (error) {
      logger.error("Error booking meeting slot:", error);
      throw error;
    }
  }

  // Get bookings with filters
  async getBookings(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        date,
        customerEmail,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (customerEmail) filter.customerEmail = customerEmail;

      // Date filter
      if (date) {
        const targetDate = new Date(date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        filter.createdAt = {
          $gte: targetDate,
          $lt: nextDay,
        };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [bookings, total] = await Promise.all([
        MeetingBooking.find(filter)
          .populate("slotId")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        MeetingBooking.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting bookings:", error);
      throw error;
    }
  }

  // Update booking status
  async updateBooking(bookingId, updateData) {
    try {
      const booking = await MeetingBooking.findByIdAndUpdate(
        bookingId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("slotId");

      if (!booking) {
        throw new Error("Booking not found");
      }

      return booking;
    } catch (error) {
      logger.error("Error updating booking:", error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason = "") {
    try {
      const booking = await this.updateBooking(bookingId, {
        status: "cancelled",
        notes: reason ? `Cancelled: ${reason}` : "Cancelled by customer",
      });

      // Send cancellation notification
      setImmediate(async () => {
        try {
          await this.sendCancellationNotification(booking);
          logger.info(
            `Cancellation notification sent for ${booking.bookingReference}`
          );
        } catch (error) {
          logger.error(`Failed to send cancellation notification:`, error);
        }
      });

      return booking;
    } catch (error) {
      logger.error("Error cancelling booking:", error);
      throw error;
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking) {
    const emailData = {
      to: booking.customerEmail,
      subject: `Meeting Confirmed - ${booking.bookingReference}`,
      template: "meeting-confirmation",
      data: {
        customerName: booking.customerName,
        bookingReference: booking.bookingReference,
        date: booking.slotId.date.toDateString(),
        timeRange: booking.slotId.timeRange,
        meetingPurpose: booking.meetingPurpose,
        meetingLink:
          booking.meetingLink || "Will be shared closer to the meeting time",
      },
    };

    return await emailService.sendEmail(emailData);
  }

  // Send WhatsApp confirmation
  async sendWhatsAppConfirmation(booking) {
    const message = `🎉 *Meeting Confirmed!*

📅 *Reference:* ${booking.bookingReference}
👤 *Name:* ${booking.customerName}
📅 *Date:* ${booking.slotId.date.toDateString()}
⏰ *Time:* ${booking.slotId.timeRange}
🎯 *Purpose:* ${booking.meetingPurpose}

We'll send you the meeting link closer to the scheduled time.

Thank you for choosing DataScube!`;

    return await whatsappService.sendTextMessage(
      booking.customerPhone,
      message
    );
  }

  // Send admin notification
  async sendAdminNotification(booking) {
    const message = `🔔 *New Meeting Booking*

📝 *Reference:* ${booking.bookingReference}
👤 *Customer:* ${booking.customerName}
📧 *Email:* ${booking.customerEmail}
📱 *Phone:* ${booking.customerPhone}
🏢 *Company:* ${booking.customerCompany || "Not provided"}
📅 *Date:* ${booking.slotId.date.toDateString()}
⏰ *Time:* ${booking.slotId.timeRange}
🎯 *Purpose:* ${booking.meetingPurpose}

💬 *Description:*
${booking.meetingDescription || "No description provided"}

Please prepare for the meeting and send the meeting link.`;

    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "917300340014";
    return await whatsappService.sendTextMessage(adminPhone, message);
  }

  // Send cancellation notification
  async sendCancellationNotification(booking) {
    const message = `❌ *Meeting Cancelled*

📝 *Reference:* ${booking.bookingReference}
👤 *Customer:* ${booking.customerName}
📅 *Date:* ${booking.slotId.date.toDateString()}
⏰ *Time:* ${booking.slotId.timeRange}

The meeting has been cancelled. Please follow up if needed.`;

    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "917300340014";
    return await whatsappService.sendTextMessage(adminPhone, message);
  }

  // Get booking statistics
  async getBookingStats() {
    try {
      const stats = await MeetingBooking.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            confirmed: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
            noShow: {
              $sum: { $cond: [{ $eq: ["$status", "no-show"] }, 1, 0] },
            },
          },
        },
      ]);

      const purposeStats = await MeetingBooking.aggregate([
        {
          $group: {
            _id: "$meetingPurpose",
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        overview: stats[0] || {
          total: 0,
          confirmed: 0,
          pending: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
        },
        byPurpose: purposeStats,
      };
    } catch (error) {
      logger.error("Error getting booking stats:", error);
      throw error;
    }
  }
}

module.exports = new MeetingService();
