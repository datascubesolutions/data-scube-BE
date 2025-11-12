#!/usr/bin/env node

const mongoose = require("mongoose");
const MeetingSlot = require("../src/models/MeetingSlot");
const logger = require("../src/utils/logger");
require("dotenv").config();

async function setupMeetingSlots() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Create slots for the next 30 days
    const today = new Date();
    const promises = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      promises.push(MeetingSlot.createDefaultSlotsForDate(date));
    }

    await Promise.all(promises);

    console.log("✅ Meeting slots created for the next 30 business days");

    // Display summary
    const totalSlots = await MeetingSlot.countDocuments();
    console.log(`📊 Total slots in database: ${totalSlots}`);

    // Show sample slots
    const sampleSlots = await MeetingSlot.find()
      .limit(8)
      .sort({ date: 1, slotNumber: 1 });
    console.log("\n📅 Sample slots created:");
    sampleSlots.forEach((slot) => {
      console.log(
        `   ${slot.date.toDateString()} - Slot ${slot.slotNumber}: ${slot.timeRange}`
      );
    });
  } catch (error) {
    console.error("❌ Error setting up meeting slots:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run the setup
setupMeetingSlots();
