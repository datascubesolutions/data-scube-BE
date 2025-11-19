#!/bin/bash

echo "📧 Testing Inquiry Email with Logo"
echo "=================================="
echo ""
echo "Sending inquiry to nikulkumar730@gmail.com..."
echo ""

curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "nikulkumar730@gmail.com",
    "phone": "+917300340014",
    "company": "Test Company",
    "subject": "Testing Email with Logo",
    "message": "This is a test inquiry to verify the email template with the DataScube logo. Please check if the logo appears correctly in the email.",
    "inquiryType": "general",
    "priority": "medium",
    "source": "api"
  }'

echo ""
echo ""
echo "✅ Request sent!"
echo ""
echo "💡 Next steps:"
echo "1. Check nikulkumar730@gmail.com inbox"
echo "2. Look for email with subject: 'Thank you for contacting us - Inquiry #...'"
echo "3. Verify the DataScube logo appears at the top"
echo "4. Check spam folder if not in inbox"
echo ""