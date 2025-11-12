#!/usr/bin/env node

const mongoose = require("mongoose");
require("dotenv").config();

async function testConnection() {
  console.log("🔍 Testing MongoDB Connection...");
  console.log(
    "Connection String:",
    process.env.MONGODB_URI.replace(/\/\/.*:.*@/, "//***:***@")
  );

  try {
    // Set a shorter timeout for testing
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 seconds
      connectTimeoutMS: 5000,
    };

    console.log("⏳ Attempting to connect...");
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("✅ MongoDB connection successful!");

    // Test a simple operation
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Possible solutions:");
      console.log("1. Check if your IP is whitelisted in MongoDB Atlas");
      console.log("2. Verify the cluster is running (not paused)");
      console.log("3. Check your internet connection");
      console.log("4. Try using 0.0.0.0/0 in IP whitelist temporarily");
    }

    if (error.message.includes("authentication failed")) {
      console.log("\n💡 Authentication issue:");
      console.log("1. Check username and password");
      console.log("2. Ensure user has proper database permissions");
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

testConnection();
