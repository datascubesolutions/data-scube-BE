# Time Format Examples - 12-Hour AM/PM Display

## Overview

All meeting times are displayed in user-friendly 12-hour format with AM/PM indicators, making it easy for customers worldwide to understand meeting times.

## Format Features

- ✅ **12-Hour Format**: Times shown as 9:00 AM, 2:30 PM, etc.
- ✅ **AM/PM Indicators**: Clear morning/afternoon/evening distinction
- ✅ **Timezone Abbreviations**: EST, PST, IST, etc.
- ✅ **Automatic Conversion**: Times converted to customer's timezone

## API Response Format

### Get Available Slots Response

```json
{
  "success": true,
  "data": {
    "date": "2024-11-05",
    "timezone": "America/New_York",
    "slots": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "slotNumber": 1,
        "startTime": "09:00",
        "endTime": "10:30",
        "timezone": "Asia/Kolkata",
        "displayStartTime": "22:30",
        "displayEndTime": "00:00",
        "displayStartTime12Hour": "10:30 PM",
        "displayEndTime12Hour": "12:00 AM",
        "displayTimezone": "America/New_York",
        "displayTimeRange": "10:30 PM EST/EDT - 12:00 AM EST/EDT",
        "isBooked": false,
        "availableSpots": 1,
        "totalSpots": 1
      }
    ]
  }
}
```

## Time Conversion Examples

### India (IST) - Original Times

| Slot | Time (24h)    | Time (12h AM/PM)        |
| ---- | ------------- | ----------------------- |
| 1    | 09:00 - 10:30 | 9:00 AM - 10:30 AM IST  |
| 2    | 11:00 - 12:30 | 11:00 AM - 12:30 PM IST |
| 3    | 14:00 - 15:30 | 2:00 PM - 3:30 PM IST   |
| 4    | 16:00 - 17:30 | 4:00 PM - 5:30 PM IST   |

### New York (EST) - Converted Times

| Slot | Time (24h)    | Time (12h AM/PM)        |
| ---- | ------------- | ----------------------- |
| 1    | 22:30 - 00:00 | 10:30 PM - 12:00 AM EST |
| 2    | 00:30 - 02:00 | 12:30 AM - 2:00 AM EST  |
| 3    | 03:30 - 05:00 | 3:30 AM - 5:00 AM EST   |
| 4    | 05:30 - 07:00 | 5:30 AM - 7:00 AM EST   |

### Los Angeles (PST) - Converted Times

| Slot | Time (24h)    | Time (12h AM/PM)       |
| ---- | ------------- | ---------------------- |
| 1    | 19:30 - 21:00 | 7:30 PM - 9:00 PM PST  |
| 2    | 21:30 - 23:00 | 9:30 PM - 11:00 PM PST |
| 3    | 00:30 - 02:00 | 12:30 AM - 2:00 AM PST |
| 4    | 02:30 - 04:00 | 2:30 AM - 4:00 AM PST  |

### Chicago (CST) - Converted Times

| Slot | Time (24h)    | Time (12h AM/PM)       |
| ---- | ------------- | ---------------------- |
| 1    | 21:30 - 23:00 | 9:30 PM - 11:00 PM CST |
| 2    | 23:30 - 01:00 | 11:30 PM - 1:00 AM CST |
| 3    | 02:30 - 04:00 | 2:30 AM - 4:00 AM CST  |
| 4    | 04:30 - 06:00 | 4:30 AM - 6:00 AM CST  |

## Frontend Display Examples

### Example 1: Slot List Display

```javascript
// Display slots with AM/PM format
slots.forEach((slot) => {
  if (!slot.isBooked) {
    console.log(`
      ✅ Available
      Slot ${slot.slotNumber}
      ${slot.displayTimeRange}
    `);
  } else {
    console.log(`
      ❌ Booked
      Slot ${slot.slotNumber}
      ${slot.displayTimeRange}
    `);
  }
});

// Output:
// ✅ Available
// Slot 1
// 10:30 PM EST/EDT - 12:00 AM EST/EDT
```

### Example 2: Booking Confirmation

```javascript
// Show booking confirmation with AM/PM
const booking = {
  bookingReference: "MTG-ABC123",
  customerName: "John Doe",
  date: "November 5, 2024",
  displayTimeRange: "10:30 PM EST - 12:00 AM EST",
};

console.log(`
  🎉 Meeting Confirmed!
  
  Reference: ${booking.bookingReference}
  Name: ${booking.customerName}
  Date: ${booking.date}
  Time: ${booking.displayTimeRange}
`);

// Output:
// 🎉 Meeting Confirmed!
//
// Reference: MTG-ABC123
// Name: John Doe
// Date: November 5, 2024
// Time: 10:30 PM EST - 12:00 AM EST
```

### Example 3: Calendar Integration

```javascript
// Format for calendar display
function formatForCalendar(slot) {
  return {
    title: `Meeting - Slot ${slot.slotNumber}`,
    start: `${slot.displayStartTime12Hour}`,
    end: `${slot.displayEndTime12Hour}`,
    timezone: slot.displayTimezone,
    description: `${slot.displayTimeRange}`,
  };
}

// Output:
// {
//   title: "Meeting - Slot 1",
//   start: "10:30 PM",
//   end: "12:00 AM",
//   timezone: "America/New_York",
//   description: "10:30 PM EST/EDT - 12:00 AM EST/EDT"
// }
```

## Email/WhatsApp Notification Format

### Customer Confirmation Email

```
Subject: Meeting Confirmed - MTG-ABC123

Hi John,

Your meeting has been confirmed!

📅 Date: November 5, 2024
⏰ Time: 10:30 PM - 12:00 AM EST
      (9:00 AM - 10:30 AM IST)
📝 Reference: MTG-ABC123
🎯 Purpose: Product Demo

We'll send you the meeting link closer to the scheduled time.

Thank you!
DataScube Team
```

### WhatsApp Confirmation

```
🎉 *Meeting Confirmed!*

📝 *Reference:* MTG-ABC123
👤 *Name:* John Doe
📅 *Date:* November 5, 2024
⏰ *Time:* 10:30 PM - 12:00 AM EST
         (9:00 AM - 10:30 AM IST)
🎯 *Purpose:* Product Demo

We'll send you the meeting link closer to the scheduled time.

Thank you for choosing DataScube!
```

## React Component Example

```jsx
import React from "react";

function MeetingSlot({ slot }) {
  return (
    <div className={`slot ${slot.isBooked ? "booked" : "available"}`}>
      <div className="slot-number">Slot {slot.slotNumber}</div>
      <div className="slot-time">{slot.displayTimeRange}</div>
      <div className="slot-time-parts">
        <span className="start">{slot.displayStartTime12Hour}</span>
        <span className="separator">-</span>
        <span className="end">{slot.displayEndTime12Hour}</span>
      </div>
      <div className="slot-status">
        {slot.isBooked ? (
          <span className="badge booked">❌ Booked</span>
        ) : (
          <span className="badge available">✅ Available</span>
        )}
      </div>
      {!slot.isBooked && <button className="book-btn">Book This Slot</button>}
    </div>
  );
}

// Usage:
// <MeetingSlot slot={slot} />
```

## Vue Component Example

```vue
<template>
  <div :class="['slot', slot.isBooked ? 'booked' : 'available']">
    <div class="slot-number">Slot {{ slot.slotNumber }}</div>
    <div class="slot-time">{{ slot.displayTimeRange }}</div>
    <div class="slot-time-parts">
      <span class="start">{{ slot.displayStartTime12Hour }}</span>
      <span class="separator">-</span>
      <span class="end">{{ slot.displayEndTime12Hour }}</span>
    </div>
    <div class="slot-status">
      <span v-if="slot.isBooked" class="badge booked">❌ Booked</span>
      <span v-else class="badge available">✅ Available</span>
    </div>
    <button v-if="!slot.isBooked" class="book-btn" @click="bookSlot">
      Book This Slot
    </button>
  </div>
</template>

<script>
export default {
  props: ["slot"],
  methods: {
    bookSlot() {
      this.$emit("book", this.slot);
    },
  },
};
</script>
```

## Best Practices

1. **Always Show AM/PM**: Never show just "10:30" - always include AM/PM
2. **Include Timezone**: Always show timezone abbreviation (EST, PST, IST)
3. **Show Both Timezones**: For international meetings, show both customer's time and IST
4. **Use Consistent Format**: Stick to one format throughout your app
5. **Highlight Current Time**: If showing multiple timezones, highlight the customer's local time

## Testing

Run the test script to see all time format examples:

```bash
node scripts/test-time-formats.js
```

This will show you:

- 24-hour to 12-hour conversions
- Timezone conversions with AM/PM
- Sample slot displays
- All 4 daily slots in different timezones

All times are now user-friendly with 12-hour AM/PM format! 🎉
