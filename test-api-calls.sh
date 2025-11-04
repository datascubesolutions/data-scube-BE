#!/bin/bash

echo "🧪 Testing DataScube API CORS Configuration"
echo "============================================="

API_URL="https://data-scube-be.onrender.com"
ORIGIN="https://tourmaline-concha-dcdeb2.netlify.app"

echo ""
echo "1️⃣ Testing OPTIONS preflight request..."
curl -X OPTIONS "${API_URL}/api/inquiries" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

echo ""
echo ""
echo "2️⃣ Testing Health Check (GET)..."
curl -X GET "${API_URL}/api/health" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo ""
echo "3️⃣ Testing Create Inquiry (POST) - Corrected payload..."
curl -X POST "${API_URL}/api/inquiries" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nikul kumar",
    "email": "nikulkumar730@gmail.com", 
    "phone": "7300340014",
    "company": "aaa",
    "message": "aaaaa",
    "inquiryType": "other"
  }' \
  -v

echo ""
echo ""
echo "4️⃣ Testing with general inquiry type..."
curl -X POST "${API_URL}/api/inquiries" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890", 
    "company": "Test Company",
    "message": "Test message for API",
    "inquiryType": "general"
  }' \
  -v

echo ""
echo "✅ Test completed!"