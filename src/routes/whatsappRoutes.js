const express = require("express");
const whatsappService = require("../services/whatsappService");
const logger = require("../utils/logger");

const router = express.Router();

// Webhook verification (GET)
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const result = whatsappService.verifyWebhook(mode, token, challenge);

  if (result) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

// Webhook for receiving messages (POST)
router.post("/webhook", (req, res) => {
  try {
    const success = whatsappService.handleWebhook(req.body);

    if (success) {
      res.status(200).send("OK");
    } else {
      res.status(400).send("Bad Request");
    }
  } catch (error) {
    logger.error("WhatsApp webhook error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Test endpoint to send message
router.post("/test-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required",
      });
    }

    const result = await whatsappService.sendTextMessage(phoneNumber, message);

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Test message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send WhatsApp message",
      error: error.message,
    });
  }
});

module.exports = router;
