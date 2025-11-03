# Inquiry API Payload

## Required Fields Only

```json
{
  "name": "kaushal jadav",
  "email": "tester@gmail.com",
  "phone": "9924879708",
  "company": "LOM",
  "message": "123",
  "inquiryType": "erp-solutions"
}
```

## All Available Fields

```json
{
  "name": "kaushal jadav",
  "email": "tester@gmail.com",
  "phone": "9924879708",
  "company": "LOM",
  "message": "123",
  "inquiryType": "erp-solutions",
  "subject": "Optional subject line",
  "priority": "medium",
  "source": "website",
  "tags": ["tag1", "tag2"]
}
```

## Valid Values

- **inquiryType**: `"general"`, `"support"`, `"sales"`, `"partnership"`, `"technical"`, `"erp-solutions"`
- **priority**: `"low"`, `"medium"`, `"high"`, `"urgent"` (defaults to "medium")
- **source**: `"website"`, `"mobile-app"`, `"api"`, `"referral"` (defaults to "website")

## Field Requirements

### Required Fields:

- `name` (2-100 characters)
- `email` (valid email format)
- `phone` (valid phone number format)
- `company` (max 200 characters)
- `message` (1-2000 characters)
- `inquiryType` (must be one of the valid values)

### Optional Fields:

- `subject` (5-200 characters if provided)
- `priority` (defaults to "medium")
- `source` (defaults to "website")
- `tags` (array of strings, max 10 items, each max 50 characters)
