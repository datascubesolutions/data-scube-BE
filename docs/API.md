# DataScube API Documentation

## Overview

The DataScube API is a RESTful service for managing customer inquiries. It provides endpoints for creating, retrieving, updating, and deleting inquiries, along with comprehensive filtering and statistics.

## Base URL

```
Production: https://api.datascube.com
Development: http://localhost:3000/api
```

## Authentication

Currently, the API uses IP-based rate limiting. Authentication will be added in future versions.

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Inquiry creation: 5 requests per 15 minutes per IP

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "pagination": object (for paginated responses),
  "errors": array (for validation errors)
}
```

## Endpoints

### Health Check

#### GET /health

Returns service health status.

**Response:**

```json
{
  "success": true,
  "data": {
    "uptime": 12345,
    "message": "OK",
    "timestamp": "2023-01-15T10:30:00.000Z",
    "environment": "production",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "memory": {
        "used": 45.67,
        "total": 128.0,
        "external": 12.34
      }
    }
  }
}
```

### Inquiries

#### POST /inquiries

Create a new inquiry.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "subject": "Product Inquiry",
  "message": "I am interested in learning more about your services.",
  "inquiryType": "sales",
  "priority": "medium",
  "source": "website",
  "tags": ["product", "demo"]
}
```

**Required Fields:**

- `name` (string, 2-100 chars)
- `email` (valid email)
- `subject` (string, 5-200 chars)
- `message` (string, 10-2000 chars)

**Optional Fields:**

- `phone` (valid phone number)
- `company` (string, max 200 chars)
- `inquiryType` (enum: general, support, sales, partnership, technical)
- `priority` (enum: low, medium, high, urgent)
- `source` (enum: website, mobile-app, api, referral)
- `tags` (array of strings, max 10 items)

**Response:**

```json
{
  "success": true,
  "message": "Inquiry submitted successfully",
  "data": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "status": "pending",
    "createdAt": "2023-01-15T10:30:00.000Z"
  }
}
```

#### GET /inquiries

Retrieve inquiries with filtering and pagination.

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, 1-100, default: 10)
- `status` (enum: pending, in-progress, resolved, closed)
- `inquiryType` (enum: general, support, sales, partnership, technical)
- `priority` (enum: low, medium, high, urgent)
- `sortBy` (enum: createdAt, updatedAt, priority, status)
- `sortOrder` (enum: asc, desc, default: desc)
- `search` (string, searches name, email, subject, company)
- `dateFrom` (ISO date)
- `dateTo` (ISO date)

**Example:**

```
GET /inquiries?status=pending&priority=high&page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "status": "pending",
      "priority": "high",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "ageInDays": 2
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /inquiries/:id

Retrieve a specific inquiry by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Tech Corp",
    "subject": "Product Inquiry",
    "message": "I am interested in learning more about your services.",
    "inquiryType": "sales",
    "priority": "medium",
    "status": "pending",
    "source": "website",
    "tags": ["product", "demo"],
    "isEmailSent": true,
    "emailSentAt": "2023-01-15T10:31:00.000Z",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z",
    "ageInDays": 2
  }
}
```

#### PUT /inquiries/:id

Update an inquiry.

**Request Body:**

```json
{
  "status": "in-progress",
  "priority": "high",
  "assignedTo": "60f7b3b3b3b3b3b3b3b3b3b4",
  "tags": ["urgent", "follow-up"],
  "responseTime": "2023-01-15T11:00:00.000Z"
}
```

**Updatable Fields:**

- `status` (enum: pending, in-progress, resolved, closed)
- `priority` (enum: low, medium, high, urgent)
- `assignedTo` (ObjectId)
- `tags` (array of strings)
- `responseTime` (ISO date)

#### DELETE /inquiries/:id

Delete an inquiry.

**Response:**

```json
{
  "success": true,
  "message": "Inquiry deleted successfully"
}
```

#### GET /inquiries/stats

Get inquiry statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 150,
      "pending": 45,
      "inProgress": 30,
      "resolved": 60,
      "closed": 15
    },
    "byType": [
      { "_id": "general", "count": 50 },
      { "_id": "support", "count": 40 },
      { "_id": "sales", "count": 35 },
      { "_id": "technical", "count": 25 }
    ],
    "byPriority": [
      { "_id": "low", "count": 60 },
      { "_id": "medium", "count": 50 },
      { "_id": "high", "count": 30 },
      { "_id": "urgent", "count": 10 }
    ]
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Errors

#### Validation Error (400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Name is required", "Please provide a valid email address"]
}
```

#### Rate Limit Error (429)

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

#### Not Found Error (404)

```json
{
  "success": false,
  "message": "Inquiry not found"
}
```

## Email Notifications

When an inquiry is created, the system automatically:

1. Sends a confirmation email to the user
2. Sends a notification email to the admin

The confirmation email includes:

- Inquiry details and ID
- Expected response time
- Contact information
- Beautiful HTML formatting

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: IP-based request limiting
- **Input Validation**: Comprehensive data validation
- **Sanitization**: XSS protection
- **Logging**: Security event logging

## SDKs and Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Create inquiry
const createInquiry = async inquiryData => {
  try {
    const response = await axios.post('http://localhost:3000/api/inquiries', inquiryData);
    return response.data;
  } catch (error) {
    console.error('Error creating inquiry:', error.response.data);
  }
};

// Get inquiries
const getInquiries = async (filters = {}) => {
  try {
    const response = await axios.get('http://localhost:3000/api/inquiries', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching inquiries:', error.response.data);
  }
};
```

### cURL Examples

```bash
# Create inquiry
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Product Inquiry",
    "message": "I am interested in your services."
  }'

# Get inquiries with filters
curl "http://localhost:3000/api/inquiries?status=pending&limit=5"

# Get inquiry by ID
curl http://localhost:3000/api/inquiries/60f7b3b3b3b3b3b3b3b3b3b3

# Update inquiry
curl -X PUT http://localhost:3000/api/inquiries/60f7b3b3b3b3b3b3b3b3b3b3 \
  -H "Content-Type: application/json" \
  -d '{"status": "resolved"}'
```

## Webhooks (Future Feature)

Planned webhook support for:

- New inquiry created
- Inquiry status changed
- High priority inquiry received

## Changelog

### v1.0.0

- Initial release
- Basic CRUD operations
- Email notifications
- Rate limiting
- Comprehensive validation
