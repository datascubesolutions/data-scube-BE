const Inquiry = require("../models/Inquiry");
const emailService = require("../services/emailService");
const whatsappService = require("../services/whatsappService");
const logger = require("../utils/logger");
const {
  createInquirySchema,
  updateInquirySchema,
  queryInquirySchema,
} = require("../validators/inquiryValidator");

class InquiryController {
  // Create new inquiry
  async createInquiry(req, res, next) {
    try {
      // Validate request body
      const { error, value } = createInquirySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      // Add metadata
      const inquiryData = {
        ...value,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
      };

      // Create inquiry
      const inquiry = new Inquiry(inquiryData);
      await inquiry.save();

      // Send confirmation email asynchronously
      setImmediate(async () => {
        try {
          await emailService.sendInquiryConfirmation(inquiry);
          inquiry.isEmailSent = true;
          inquiry.emailSentAt = new Date();
          await inquiry.save();
          logger.info(`Confirmation email sent for inquiry ${inquiry._id}`);
        } catch (emailError) {
          logger.error(
            `Failed to send confirmation email for inquiry ${inquiry._id}:`,
            emailError
          );
        }
      });

      // Send WhatsApp thank you message (if phone number provided)
      if (inquiry.phone) {
        setImmediate(async () => {
          try {
            await whatsappService.sendThankYouMessage(inquiry);
            inquiry.isWhatsAppSent = true;
            inquiry.whatsAppSentAt = new Date();
            await inquiry.save();
            logger.info(
              `WhatsApp thank you message sent for inquiry ${inquiry._id}`
            );
          } catch (whatsappError) {
            logger.error(
              `Failed to send WhatsApp message for inquiry ${inquiry._id}:`,
              whatsappError
            );
          }
        });
      }

      // Send notification to admin
      setImmediate(async () => {
        try {
          await emailService.sendAdminNotification(inquiry);
          logger.info(`Admin notification sent for inquiry ${inquiry._id}`);
        } catch (emailError) {
          logger.error(
            `Failed to send admin notification for inquiry ${inquiry._id}:`,
            emailError
          );
        }
      });

      // Send WhatsApp notification to admin
      setImmediate(async () => {
        try {
          await whatsappService.sendAdminNotification(inquiry);
          logger.info(
            `WhatsApp admin notification sent for inquiry ${inquiry._id}`
          );
        } catch (whatsappError) {
          logger.error(
            `Failed to send WhatsApp admin notification for inquiry ${inquiry._id}:`,
            whatsappError
          );
        }
      });

      res.status(201).json({
        success: true,
        message: "Inquiry submitted successfully",
        data: {
          id: inquiry._id,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
        },
      });
    } catch (error) {
      logger.error("Error creating inquiry:", error);
      next(error);
    }
  }

  // Get all inquiries with filtering and pagination
  async getInquiries(req, res, next) {
    try {
      // Validate query parameters
      const { error, value } = queryInquirySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const {
        page,
        limit,
        status,
        inquiryType,
        priority,
        sortBy,
        sortOrder,
        search,
        dateFrom,
        dateTo,
      } = value;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (inquiryType) filter.inquiryType = inquiryType;
      if (priority) filter.priority = priority;

      // Date range filter
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [inquiries, total] = await Promise.all([
        Inquiry.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("assignedTo", "name email"),
        Inquiry.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: inquiries,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      logger.error("Error fetching inquiries:", error);
      next(error);
    }
  }

  // Get inquiry by ID
  async getInquiryById(req, res, next) {
    try {
      const { id } = req.params;

      const inquiry = await Inquiry.findById(id).populate(
        "assignedTo",
        "name email"
      );

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      res.json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      logger.error("Error fetching inquiry:", error);
      next(error);
    }
  }

  // Update inquiry
  async updateInquiry(req, res, next) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateInquirySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.details.map((detail) => detail.message),
        });
      }

      const inquiry = await Inquiry.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate("assignedTo", "name email");

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      res.json({
        success: true,
        message: "Inquiry updated successfully",
        data: inquiry,
      });
    } catch (error) {
      logger.error("Error updating inquiry:", error);
      next(error);
    }
  }

  // Delete inquiry
  async deleteInquiry(req, res, next) {
    try {
      const { id } = req.params;

      const inquiry = await Inquiry.findByIdAndDelete(id);

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message: "Inquiry not found",
        });
      }

      res.json({
        success: true,
        message: "Inquiry deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting inquiry:", error);
      next(error);
    }
  }

  // Get inquiry statistics
  async getInquiryStats(req, res, next) {
    try {
      const stats = await Inquiry.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
            resolved: {
              $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
            },
            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          },
        },
      ]);

      const typeStats = await Inquiry.aggregate([
        {
          $group: {
            _id: "$inquiryType",
            count: { $sum: 1 },
          },
        },
      ]);

      const priorityStats = await Inquiry.aggregate([
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
          },
          byType: typeStats,
          byPriority: priorityStats,
        },
      });
    } catch (error) {
      logger.error("Error fetching inquiry stats:", error);
      next(error);
    }
  }
}

module.exports = new InquiryController();
