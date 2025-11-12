#!/usr/bin/env node

const axios = require("axios");

async function testInquiryEmail() {
  console.log("📧 Testing Email Service with Inquiry Submission\n");

  const API_URL = process.env.API_URL || "http://localhost:3000";

  const inquiryData = {
    name: "ritika",
    email: "createwithritika@gmail.com",
    phone: "+1234567890",
    company: "Tech Solutions Inc",
    subject: "Product Integration Inquiry",
    message:
      "I am interested in integrating your DataScube solution with our existing infrastructure. Could you please provide more information about the API capabilities and pricing?",
    inquiryType: "sales",
    priority: "medium",
    source: "website",
    tags: ["integration", "pricing", "api"],
  };

  console.log("📝 Inquiry Data:");
  console.log(JSON.stringify(inquiryData, null, 2));
  console.log("\n⏳ Submitting inquiry...\n");

  try {
    const response = await axios.post(`${API_URL}/api/inquiries`, inquiryData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Inquiry submitted successfully!\n");
    console.log("📊 Response:");
    console.log(JSON.stringify(response.data, null, 2));

    console.log("\n📧 Email Status:");
    console.log(
      "- Confirmation email should be sent to: createwithritika@gmail.com"
    );
    console.log(
      "- Admin notification should be sent to: apptestnodemailer730@gmail.com"
    );

    console.log("\n💡 Check the following:");
    console.log(
      "1. Check createwithritika@gmail.com inbox for confirmation email"
    );
    console.log("2. Check spam/junk folder if not in inbox");
    console.log("3. Check server logs for email sending status");
    console.log("4. Verify SMTP credentials in .env file");

    console.log("\n✅ Test completed!");
  } catch (error) {
    console.error("❌ Error submitting inquiry:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Error:", error.message);
    }

    console.log("\n💡 Troubleshooting:");
    console.log("1. Make sure the server is running (npm start)");
    console.log("2. Check MongoDB connection");
    console.log("3. Verify SMTP settings in .env file");
    console.log("4. Check server logs for detailed error messages");
  }
}

// Run the test
testInquiryEmail();
