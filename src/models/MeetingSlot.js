const mongoose = require("mongoose");

const meetingSlotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    slotNumber: {
      type: Number,
      required: [true, "Slot number is required"],
      min: 1,
      max: 4,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      // Format: "09:00"
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      // Format: "10:30"
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata", // IST timezone
      // Supports: "America/New_York", "America/Los_Angeles", "America/Chicago", etc.
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxBookings: {
      type: Number,
      default: 1, // Can be increased for group meetings
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for date and slot number
meetingSlotSchema.index({ date: 1, slotNumber: 1 }, { unique: true });

// Virtual for formatted date
meetingSlotSchema.virtual("formattedDate").get(function () {
  return this.date.toISOString().split("T")[0];
});

// Virtual for time range
meetingSlotSchema.virtual("timeRange").get(function () {
  return `${this.startTime} - ${this.endTime}`;
});

// Static method to get default slots for a date with timezone support
meetingSlotSchema.statics.createDefaultSlotsForDate = async function (
  date,
  timezone = "Asia/Kolkata"
) {
  // Default slots in IST (India Standard Time)
  const istSlots = [
    { slotNumber: 1, startTime: "09:00", endTime: "10:30" },
    { slotNumber: 2, startTime: "11:00", endTime: "12:30" },
    { slotNumber: 3, startTime: "14:00", endTime: "15:30" },
    { slotNumber: 4, startTime: "16:00", endTime: "17:30" },
  ];

  // US timezone slots (EST - Eastern Standard Time)
  // IST is 10.5 hours ahead of EST, so we create evening slots for US customers
  const estSlots = [
    { slotNumber: 1, startTime: "20:00", endTime: "21:30" }, // 9:30 AM EST
    { slotNumber: 2, startTime: "22:00", endTime: "23:30" }, // 11:30 AM EST
    { slotNumber: 3, startTime: "00:30", endTime: "02:00" }, // 2:00 PM EST (next day IST)
    { slotNumber: 4, startTime: "03:00", endTime: "04:30" }, // 4:30 PM EST (next day IST)
  ];

  const defaultSlots = timezone.includes("America") ? estSlots : istSlots;

  const slots = [];
  for (const slot of defaultSlots) {
    try {
      const newSlot = await this.create({
        date: new Date(date),
        timezone: timezone,
        ...slot,
      });
      slots.push(newSlot);
    } catch (error) {
      // Slot might already exist, skip
      if (error.code !== 11000) {
        throw error;
      }
    }
  }
  return slots;
};

module.exports = mongoose.model("MeetingSlot", meetingSlotSchema);
