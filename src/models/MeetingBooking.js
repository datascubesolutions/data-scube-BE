const mongoose = require("mongoose");

const meetingBookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MeetingSlot",
      required: [true, "Slot ID is required"],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      index: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    customerCompany: {
      type: String,
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    meetingPurpose: {
      type: String,
      required: [true, "Meeting purpose is required"],
      enum: [
        "product-demo",
        "consultation",
        "support",
        "sales-discussion",
        "partnership",
        "technical-discussion",
        "other",
      ],
      default: "consultation",
    },
    meetingDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    customerTimezone: {
      type: String,
      default: "Asia/Kolkata",
      // Examples: "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London"
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no-show"],
      default: "confirmed",
      index: true,
    },
    bookingReference: {
      type: String,
      unique: true,
      index: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate booking reference before saving
meetingBookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `MTG-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for customer full info
meetingBookingSchema.virtual("customerInfo").get(function () {
  return {
    name: this.customerName,
    email: this.customerEmail,
    phone: this.customerPhone,
    company: this.customerCompany,
  };
});

// Indexes for better performance
meetingBookingSchema.index({ customerEmail: 1, createdAt: -1 });
meetingBookingSchema.index({ status: 1, createdAt: -1 });
meetingBookingSchema.index({ createdAt: -1 });

// Static methods
meetingBookingSchema.statics.getBookingsByDate = function (date) {
  return this.find({
    createdAt: {
      $gte: new Date(date),
      $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
    },
  })
    .populate("slotId")
    .sort({ createdAt: -1 });
};

meetingBookingSchema.statics.getBookingsByStatus = function (status) {
  return this.find({ status }).populate("slotId").sort({ createdAt: -1 });
};

module.exports = mongoose.model("MeetingBooking", meetingBookingSchema);
