#!/usr/bin/env node

/**
 * Script to verify email environment variables are set correctly
 * Run this on your Render server to check configuration
 */

console.log("\n=== Email Environment Variables Check ===\n");

const requiredVars = {
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  COMPANY_NAME: process.env.COMPANY_NAME,
  COMPANY_EMAIL: process.env.COMPANY_EMAIL,
  COMPANY_PHONE: process.env.COMPANY_PHONE,
  LOGO_URL: process.env.LOGO_URL,
};

let allSet = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    // Mask sensitive values
    const displayValue = key.includes("PASS")
      ? "***" + value.slice(-4)
      : key.includes("MAIL") || key.includes("EMAIL")
        ? value.substring(0, 3) + "***@" + value.split("@")[1]
        : value.substring(0, 20) + (value.length > 20 ? "..." : "");

    console.log(`✅ ${key.padEnd(20)} = ${displayValue}`);
  } else {
    console.log(`❌ ${key.padEnd(20)} = NOT SET`);
    allSet = false;
  }
}

console.log("\n=== Optional Variables (for cleanup) ===\n");

const oldVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
};

for (const [key, value] of Object.entries(oldVars)) {
  if (value) {
    console.log(`⚠️  ${key.padEnd(20)} = SET (can be removed)`);
  }
}

console.log("\n=== Summary ===\n");

if (allSet) {
  console.log("✅ All required email variables are set!");
  console.log("✅ Email service should work correctly.");
} else {
  console.log("❌ Some required variables are missing.");
  console.log("❌ Email service will not work until all variables are set.");
  console.log("\nAdd missing variables to your Render environment:");
  console.log("1. Go to Render Dashboard");
  console.log("2. Select your service");
  console.log("3. Go to Environment tab");
  console.log("4. Add missing variables");
  console.log("5. Save and redeploy");
}

console.log("\n");

process.exit(allSet ? 0 : 1);
