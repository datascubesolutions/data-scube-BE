const express = require("express");
const whatsappService = require("../services/whatsappService");
const logger = require("../utils/logger");

const router = express.Router();

// Test WhatsApp message sending
router.post("/send-test", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const testMessage =
      message ||
      `🎉 Hello from DataScube API!

This is a test message to verify WhatsApp integration is working.

✅ API is connected
✅ Phone number verified
✅ Ready to send notifications

Time: ${new Date().toLocaleString("en-IN")}`;

    const result = await whatsappService.sendTextMessage(
      phoneNumber,
      testMessage
    );

    res.json({
      success: true,
      message: "WhatsApp test message sent successfully!",
      data: {
        messageId: result.messages?.[0]?.id,
        phoneNumber: phoneNumber,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(JSON.stringify({
      message: "WhatsApp test error",
      error: error.message,
      code: error.code,
      stack: error.stack,
    }));
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp test message",
      error: error.response?.data || error.message,
    });
  }
});

// Test inquiry notification
router.post("/test-inquiry-notification", async (req, res) => {
  try {
    const testInquiry = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      phone: req.body.phoneNumber || "917300340014",
      company: "Test Company",
      subject: "Test WhatsApp Integration",
      message:
        "This is a test inquiry to verify WhatsApp notifications are working properly.",
      inquiryType: "technical",
      priority: "medium",
      status: "pending",
      source: "api",
      createdAt: new Date(),
    };

    // Send thank you message
    const thankYouResult =
      await whatsappService.sendThankYouMessage(testInquiry);

    // Send admin notification
    const adminResult =
      await whatsappService.sendAdminNotification(testInquiry);

    res.json({
      success: true,
      message: "WhatsApp inquiry notifications sent successfully!",
      data: {
        thankYouMessage: thankYouResult?.messages?.[0]?.id,
        adminNotification: adminResult?.messages?.[0]?.id,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(JSON.stringify({
      message: "WhatsApp inquiry test error",
      error: error.message,
      code: error.code,
      stack: error.stack,
    }));
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp inquiry notifications",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
