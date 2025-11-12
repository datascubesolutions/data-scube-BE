# Meeting Scheduling API Documentation

## Overview

Professional meeting scheduling system with time slot management, booking functionality, and automated notifications.

## Features

- ✅ **4 Daily Time Slots**: Pre-configured slots (9:00-10:30, 11:00-12:30, 14:00-15:30, 16:00-17:30)
- ✅ **Availability Tracking**: Real-time slot availability with `is_booked` flags
- ✅ **Customer Management**: Store customer details separately
- ✅ **Automated Notifications**: Email and WhatsApp confirmations
- ✅ **Booking References**: Unique booking reference numbers
- ✅ **Status Management**: Track booking lifecycle
- ✅ **Admin Dashboard**: Comprehensive booking management

## API Endpoints

### 1. Get Available Slots

```http
GET /api/meetings/slots?date=2024-11-05
```

**Response:**

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": {
    "date": "2024-11-05",
    "slots": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "slotNumber": 1,
        "startTime": "09:00",
        "endTime": "10:30",
        "timeRange": "09:00 - 10:30",
        "isBooked": false,
        "availableSpots": 1,
        "totalSpots": 1
      },
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "slotNumber": 2,
        "startTime": "11:00",
        "endTime": "12:30",
        "timeRange": "11:00 - 12:30",
        "isBooked": true,
        "availableSpots": 0,
        "totalSpots": 1
      }
    ],
    "totalSlots": 4,
    "availableSlots": 3,
    "bookedSlots": 1
  }
}
```

### 2. Book a Meeting Slot

```http
POST /api/meetings/book
```

**Request Body:**

```json
{
  "slotId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "1234567890",
  "customerCompany": "ABC Corp",
  "meetingPurpose": "product-demo",
  "meetingDescription": "Interested in ERP solutions"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Meeting booked successfully",
  "data": {
    "bookingReference": "MTG-L8X9K2M-ABC12",
    "status": "confirmed",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "date": "Tue Nov 05 2024",
    "timeRange": "09:00 - 10:30",
    "meetingPurpose": "product-demo",
    "createdAt": "2024-11-05T10:30:00.000Z"
  }
}
```

### 3. Get All Bookings (Admin)

```http
GET /api/meetings/bookings?page=1&limit=10&status=confirmed
```

### 4. Get Booking by Reference

```http
GET /api/meetings/booking/MTG-L8X9K2M-ABC12
```

### 5. Update Booking (Admin)

```http
PUT /api/meetings/booking/64f8a1b2c3d4e5f6a7b8c9d0
```

**Request Body:**

```json
{
  "status": "completed",
  "meetingLink": "https://meet.google.com/abc-def-ghi",
  "notes": "Great meeting, customer interested in premium package"
}
```

### 6. Cancel Booking

```http
PUT /api/meetings/booking/64f8a1b2c3d4e5f6a7b8c9d0/cancel
```

**Request Body:**

```json
{
  "reason": "Customer requested reschedule"
}
```

### 7. Get Customer Bookings

```http
GET /api/meetings/customer/john@example.com/bookings
```

### 8. Get Booking Statistics

```http
GET /api/meetings/stats
```

## Data Models

### Meeting Slot

```javascript
{
  date: Date,           // 2024-11-05
  slotNumber: Number,   // 1, 2, 3, 4
  startTime: String,    // "09:00"
  endTime: String,      // "10:30"
  isActive: Boolean,    // true/false
  maxBookings: Number   // 1 (can be increased for group meetings)
}
```

### Meeting Booking

```javascript
{
  slotId: ObjectId,              // Reference to MeetingSlot
  customerName: String,          // "John Doe"
  customerEmail: String,         // "john@example.com"
  customerPhone: String,         // "1234567890"
  customerCompany: String,       // "ABC Corp"
  meetingPurpose: String,        // "product-demo", "consultation", etc.
  meetingDescription: String,    // Optional description
  status: String,                // "confirmed", "pending", "cancelled", "completed", "no-show"
  bookingReference: String,      // "MTG-L8X9K2M-ABC12"
  meetingLink: String,           // Google Meet/Zoom link
  notes: String,                 // Admin notes
  reminderSent: Boolean,         // Email/SMS reminder status
  ipAddress: String,             // Client IP
  userAgent: String              // Client browser info
}
```

## Meeting Purposes

- `product-demo` - Product demonstration
- `consultation` - General consultation
- `support` - Technical support
- `sales-discussion` - Sales meeting
- `partnership` - Partnership discussion
- `technical-discussion` - Technical deep dive
- `other` - Other purposes

## Booking Status Flow

1. **pending** - Initial booking (if approval required)
2. **confirmed** - Booking confirmed
3. **completed** - Meeting completed successfully
4. **cancelled** - Booking cancelled
5. **no-show** - Customer didn't attend

## Automated Notifications

### Customer Notifications

- ✅ **Email Confirmation** - Booking details and reference
- ✅ **WhatsApp Confirmation** - Meeting details via WhatsApp
- ✅ **Cancellation Notice** - When booking is cancelled

### Admin Notifications

- ✅ **New Booking Alert** - WhatsApp notification for new bookings
- ✅ **Cancellation Alert** - When customer cancels

## Rate Limiting

- **Booking Endpoint**: 5 requests per 15 minutes per IP
- **General Endpoints**: 100 requests per 15 minutes per IP

## Error Handling

```json
{
  "success": false,
  "message": "Meeting slot is already fully booked"
}
```

## Usage Examples

### Frontend Integration

```javascript
// Get available slots
const slots = await fetch("/api/meetings/slots?date=2024-11-05");

// Book a meeting
const booking = await fetch("/api/meetings/book", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    slotId: "slot_id_here",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "1234567890",
    customerCompany: "ABC Corp",
    meetingPurpose: "product-demo",
  }),
});
```

### Admin Dashboard

```javascript
// Get all bookings
const bookings = await fetch("/api/meetings/bookings?status=confirmed");

// Get statistics
const stats = await fetch("/api/meetings/stats");

// Update booking
await fetch(`/api/meetings/booking/${bookingId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "completed",
    meetingLink: "https://meet.google.com/abc-def-ghi",
  }),
});
```

## Security Features

- ✅ Input validation with Joi
- ✅ Rate limiting on booking endpoints
- ✅ IP and User-Agent tracking
- ✅ Duplicate booking prevention
- ✅ CORS protection
- ✅ SQL injection prevention (MongoDB)

This professional meeting scheduling system provides all the features needed for a modern business appointment booking system!
