#!/usr/bin/env node

const {
  convertTo12Hour,
  convertTime,
  formatTimeWithTimezone,
  convertSlotToTimezone,
} = require("../src/utils/timezoneHelper");

console.log("🕐 Time Format Conversion Examples\n");

// Test 12-hour conversion
console.log("=== 24-Hour to 12-Hour Conversion ===");
const times24 = ["00:00", "06:30", "09:00", "12:00", "14:30", "18:00", "23:59"];

times24.forEach((time) => {
  console.log(`${time} (24h) → ${convertTo12Hour(time)}`);
});

console.log("\n=== Timezone Conversion with AM/PM ===");

// Test IST to US timezones
const istTime = "09:00";
console.log(`\nIST Time: ${convertTo12Hour(istTime)} IST`);

const usTimezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
];

usTimezones.forEach((tz) => {
  const converted = convertTime(istTime, "Asia/Kolkata", tz);
  const formatted = formatTimeWithTimezone(converted, tz, true);
  console.log(`  → ${formatted}`);
});

console.log("\n=== Sample Meeting Slot Display ===");

// Sample slot
const sampleSlot = {
  _id: "64f8a1b2c3d4e5f6a7b8c9d0",
  slotNumber: 1,
  startTime: "09:00",
  endTime: "10:30",
  timezone: "Asia/Kolkata",
  isBooked: false,
};

console.log("\nOriginal Slot (IST):");
console.log(
  `  Time: ${convertTo12Hour(sampleSlot.startTime)} - ${convertTo12Hour(sampleSlot.endTime)} IST`
);

console.log("\nConverted for US Customers:");

usTimezones.forEach((tz) => {
  const converted = convertSlotToTimezone(sampleSlot, tz, true);
  console.log(`\n  ${tz.split("/")[1]}:`);
  console.log(`    ${converted.displayTimeRange}`);
  console.log(`    Start: ${converted.displayStartTime12Hour}`);
  console.log(`    End: ${converted.displayEndTime12Hour}`);
});

console.log("\n=== All 4 Daily Slots in Different Timezones ===");

const allSlots = [
  { slotNumber: 1, startTime: "09:00", endTime: "10:30" },
  { slotNumber: 2, startTime: "11:00", endTime: "12:30" },
  { slotNumber: 3, startTime: "14:00", endTime: "15:30" },
  { slotNumber: 4, startTime: "16:00", endTime: "17:30" },
];

console.log("\n📍 India (IST):");
allSlots.forEach((slot) => {
  console.log(
    `  Slot ${slot.slotNumber}: ${convertTo12Hour(slot.startTime)} - ${convertTo12Hour(slot.endTime)} IST`
  );
});

console.log("\n📍 New York (EST):");
allSlots.forEach((slot) => {
  const start = convertTime(slot.startTime, "Asia/Kolkata", "America/New_York");
  const end = convertTime(slot.endTime, "Asia/Kolkata", "America/New_York");
  console.log(
    `  Slot ${slot.slotNumber}: ${convertTo12Hour(start)} - ${convertTo12Hour(end)} EST`
  );
});

console.log("\n📍 Los Angeles (PST):");
allSlots.forEach((slot) => {
  const start = convertTime(
    slot.startTime,
    "Asia/Kolkata",
    "America/Los_Angeles"
  );
  const end = convertTime(slot.endTime, "Asia/Kolkata", "America/Los_Angeles");
  console.log(
    `  Slot ${slot.slotNumber}: ${convertTo12Hour(start)} - ${convertTo12Hour(end)} PST`
  );
});

console.log("\n✅ All times are displayed in 12-hour format with AM/PM!\n");
