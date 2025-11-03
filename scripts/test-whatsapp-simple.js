#!/usr/bin/env node

const axios = require("axios");

async function testSimpleWhatsApp() {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/test-whatsapp/send-test",
      {
        phoneNumber: "917300340014",
        message: "Hello! This is a simple test message from DataScube API.",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response:", JSON.stringify(response.data, null, 2));
    console.log("\n📱 Check your WhatsApp for the message!");

    // Additional debugging info
    console.log("\n🔍 Debug Info:");
    console.log("- Phone Number:", "917300340014");
    console.log("- Message ID:", response.data.data?.messageId);
    console.log("- Timestamp:", response.data.data?.timestamp);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testSimpleWhatsApp();
