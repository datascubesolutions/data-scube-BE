#!/usr/bin/env node

const axios = require("axios");

async function testCORS() {
  console.log("🧪 Testing CORS Configuration...\n");

  const baseURL = process.env.API_URL || "http://localhost:3000";
  const testOrigin = "https://tourmaline-concha-dcdeb2.netlify.app";

  try {
    // Test 1: OPTIONS preflight request
    console.log("1️⃣ Testing OPTIONS preflight request...");
    const optionsResponse = await axios.options(`${baseURL}/api/health`, {
      headers: {
        Origin: testOrigin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type, Authorization",
      },
    });

    console.log("✅ OPTIONS request successful");
    console.log("   Status:", optionsResponse.status);
    console.log("   CORS Headers:", {
      "Access-Control-Allow-Origin":
        optionsResponse.headers["access-control-allow-origin"],
      "Access-Control-Allow-Methods":
        optionsResponse.headers["access-control-allow-methods"],
      "Access-Control-Allow-Headers":
        optionsResponse.headers["access-control-allow-headers"],
      "Access-Control-Allow-Credentials":
        optionsResponse.headers["access-control-allow-credentials"],
    });

    // Test 2: Actual API request
    console.log("\n2️⃣ Testing actual API request...");
    const apiResponse = await axios.get(`${baseURL}/api/health`, {
      headers: {
        Origin: testOrigin,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API request successful");
    console.log("   Status:", apiResponse.status);
    console.log("   Response:", apiResponse.data);

    // Test 3: POST request simulation
    console.log("\n3️⃣ Testing POST request simulation...");
    const testPayload = {
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      company: "Test Company",
      message: "Test message",
      inquiryType: "general",
    };

    const postResponse = await axios.post(
      `${baseURL}/api/inquiries`,
      testPayload,
      {
        headers: {
          Origin: testOrigin,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ POST request successful");
    console.log("   Status:", postResponse.status);
    console.log("   Response:", postResponse.data);
  } catch (error) {
    console.error("❌ CORS Test Failed:");
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Headers:", error.response.headers);
      console.error("   Data:", error.response.data);
    } else {
      console.error("   Error:", error.message);
    }
  }
}

// Run tests
testCORS();
