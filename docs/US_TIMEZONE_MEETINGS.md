# US Timezone Meeting Scheduling

## Overview

The meeting scheduling system now supports multiple timezones, including all major US timezones. Customers can view and book meetings in their local time.

## Supported US Timezones

### Eastern Time (ET)

- **Timezone**: `America/New_York`
- **Abbreviation**: EST/EDT
- **UTC Offset**: -05:00 (EST) / -04:00 (EDT)
- **Major Cities**: New York, Boston, Miami, Atlanta, Washington DC

### Central Time (CT)

- **Timezone**: `America/Chicago`
- **Abbreviation**: CST/CDT
- **UTC Offset**: -06:00 (CST) / -05:00 (CDT)
- **Major Cities**: Chicago, Houston, Dallas, Austin, Minneapolis

### Mountain Time (MT)

- **Timezone**: `America/Denver`
- **Abbreviation**: MST/MDT
- **UTC Offset**: -07:00 (MST) / -06:00 (MDT)
- **Major Cities**: Denver, Salt Lake City, Albuquerque

### Mountain Time (No DST)

- **Timezone**: `America/Phoenix`
- **Abbreviation**: MST
- **UTC Offset**: -07:00 (No Daylight Saving)
- **Major Cities**: Phoenix, Tucson

### Pacific Time (PT)

- **Timezone**: `America/Los_Angeles`
- **Abbreviation**: PST/PDT
- **UTC Offset**: -08:00 (PST) / -07:00 (PDT)
- **Major Cities**: Los Angeles, San Francisco, Seattle, San Diego

## API Usage

### 1. Get Supported Timezones

```http
GET /api/meetings/timezones
```

**Response:**

```json
{
  "success": true,
  "message": "Supported timezones retrieved successfully",
  "data": {
    "timezones": [
      {
        "value": "America/New_York",
        "label": "Eastern Time (EST/EDT)",
        "offset": "-05:00/-04:00"
      },
      {
        "value": "America/Chicago",
        "label": "Central Time (CST/CDT)",
        "offset": "-06:00/-05:00"
      },
      {
        "value": "America/Los_Angeles",
        "label": "Pacific Time (PST/PDT)",
        "offset": "-08:00/-07:00"
      }
    ],
    "default": "Asia/Kolkata"
  }
}
```

### 2. Get Available Slots in US Timezone

```http
GET /api/meetings/slots?date=2024-11-05&timezone=America/New_York
```

**Response:**

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
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
        "displayTimezone": "America/New_York",
        "displayTimeRange": "22:30 EST/EDT - 00:00 EST/EDT",
        "isBooked": false,
        "availableSpots": 1,
        "totalSpots": 1
      }
    ],
    "totalSlots": 4,
    "availableSlots": 3,
    "bookedSlots": 1
  }
}
```

### 3. Book Meeting with US Timezone

```http
POST /api/meetings/book
```

**Request Body:**

```json
{
  "slotId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "customerName": "John Smith",
  "customerEmail": "john@company.com",
  "customerPhone": "+12025551234",
  "customerCompany": "ABC Corp",
  "customerTimezone": "America/New_York",
  "meetingPurpose": "product-demo",
  "meetingDescription": "Interested in ERP solutions"
}
```

## Time Conversion Examples

### IST to US Timezones

| IST Time | EST (New York)      | CST (Chicago)       | MST (Denver)        | PST (Los Angeles)   |
| -------- | ------------------- | ------------------- | ------------------- | ------------------- |
| 09:00 AM | 10:30 PM (prev day) | 09:30 PM (prev day) | 08:30 PM (prev day) | 07:30 PM (prev day) |
| 11:00 AM | 12:30 AM            | 11:30 PM (prev day) | 10:30 PM (prev day) | 09:30 PM (prev day) |
| 02:00 PM | 03:30 AM            | 02:30 AM            | 01:30 AM            | 12:30 AM            |
| 04:00 PM | 05:30 AM            | 04:30 AM            | 03:30 AM            | 02:30 AM            |

### Recommended Meeting Times for US Customers

#### For Eastern Time (EST) Customers

- **Best Slots**: 9:00 PM - 11:00 PM IST (10:30 AM - 12:30 PM EST)
- **Good Slots**: 7:00 PM - 9:00 PM IST (8:30 AM - 10:30 AM EST)

#### For Pacific Time (PST) Customers

- **Best Slots**: 9:00 PM - 11:00 PM IST (7:30 AM - 9:30 AM PST)
- **Good Slots**: 12:00 AM - 2:00 AM IST (10:30 AM - 12:30 PM PST prev day)

## Frontend Integration Example

```javascript
// Get supported timezones
const timezonesResponse = await fetch("/api/meetings/timezones");
const {
  data: { timezones },
} = await timezonesResponse.json();

// Detect user's timezone
const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Get slots in user's timezone
const slotsResponse = await fetch(
  `/api/meetings/slots?date=2024-11-05&timezone=${userTimezone}`
);
const {
  data: { slots },
} = await slotsResponse.json();

// Display slots with converted times
slots.forEach((slot) => {
  console.log(`Slot ${slot.slotNumber}: ${slot.displayTimeRange}`);
  console.log(`Available: ${!slot.isBooked}`);
});

// Book meeting with timezone
const bookingResponse = await fetch("/api/meetings/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slotId: selectedSlot._id,
    customerName: "John Smith",
    customerEmail: "john@company.com",
    customerPhone: "+12025551234",
    customerCompany: "ABC Corp",
    customerTimezone: userTimezone,
    meetingPurpose: "product-demo",
  }),
});
```

## Automatic Timezone Detection

```javascript
// Detect user's timezone automatically
function detectUserTimezone() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Map to supported timezones
  const supportedTimezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Los_Angeles",
    "Asia/Kolkata",
    "Europe/London",
  ];

  // Check if detected timezone is supported
  if (supportedTimezones.includes(timezone)) {
    return timezone;
  }

  // Default to IST
  return "Asia/Kolkata";
}

// Use in your app
const userTimezone = detectUserTimezone();
console.log("User timezone:", userTimezone);
```

## Email/WhatsApp Notifications

When a US customer books a meeting, they receive notifications with times in their local timezone:

**Example Email:**

```
Meeting Confirmed!

Booking Reference: MTG-ABC123
Date: November 5, 2024
Time: 10:30 AM - 12:00 PM EST
(9:00 PM - 10:30 PM IST)

Purpose: Product Demo
```

## Best Practices

1. **Always Include Timezone**: Display timezone abbreviation with all times
2. **Show Both Timezones**: Show customer's local time and IST for clarity
3. **Timezone Selector**: Provide a dropdown for customers to select their timezone
4. **Auto-Detection**: Automatically detect and pre-select customer's timezone
5. **Confirmation**: Show converted time before final booking confirmation

## Testing

```bash
# Test with Eastern Time
curl "http://localhost:3000/api/meetings/slots?date=2024-11-05&timezone=America/New_York"

# Test with Pacific Time
curl "http://localhost:3000/api/meetings/slots?date=2024-11-05&timezone=America/Los_Angeles"

# Test with Central Time
curl "http://localhost:3000/api/meetings/slots?date=2024-11-05&timezone=America/Chicago"
```

This comprehensive timezone support ensures US customers can easily book meetings in their local time!
