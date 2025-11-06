const axios = require("axios");
const logger = require("../utils/logger");

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessPhoneNumber =
      process.env.WHATSAPP_BUSINESS_NUMBER || "+917300340014";
    this.apiVersion = "v18.0";
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  // Send thank you message after inquiry submission
  async sendThankYouMessage(inquiry) {
    try {
      // Extract phone number from inquiry (ensure it has country code)
      let phoneNumber = inquiry.phone;
      if (!phoneNumber) {
        logger.warn(`No phone number provided for inquiry ${inquiry._id}`);
        return null;
      }

      // Format phone number (remove + and ensure it starts with country code)
      phoneNumber = phoneNumber.replace(/[^\d]/g, "");
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber; // Add India country code
      }

      const messageData = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "template",
        template: {
          name: "inquiry_thank_you", // You'll create this template in Meta Business Manager
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: inquiry.name,
                },
                {
                  type: "text",
                  text: inquiry._id.toString().slice(-6), // Last 6 chars of ID
                },
              ],
            },
          ],
        },
      };

      const response = await axios.post(this.baseUrl, messageData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      logger.info(
        `WhatsApp thank you message sent to ${phoneNumber}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      logger.error(
        "Error sending WhatsApp message:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Send custom text message (for testing)
  async sendTextMessage(phoneNumber, message) {
    try {
      // Format phone number
      phoneNumber = phoneNumber.replace(/[^\d]/g, "");
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber;
      }

      const messageData = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message,
        },
      };

      const response = await axios.post(this.baseUrl, messageData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      logger.info(
        `WhatsApp text message sent to ${phoneNumber}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      logger.error(
        "Error sending WhatsApp text message:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // Send inquiry notification to admin
  async sendAdminNotification(inquiry) {
    try {
      const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "917300340014";

      const message = `🔔 *New Inquiry Alert*

📝 *ID:* #${inquiry._id.toString().slice(-6)}
👤 *Name:* ${inquiry.name}
📧 *Email:* ${inquiry.email}
📱 *Phone:* ${inquiry.phone || "Not provided"}
🏢 *Company:* ${inquiry.company || "Not provided"}
📋 *Subject:* ${inquiry.subject}
🔖 *Type:* ${inquiry.inquiryType}
⚡ *Priority:* ${inquiry.priority.toUpperCase()}
📅 *Date:* ${new Date(inquiry.createdAt).toLocaleString("en-IN")}

💬 *Message:*
${inquiry.message}

Please review and respond promptly.`;

      return await this.sendTextMessage(adminPhone, message);
    } catch (error) {
      logger.error(JSON.stringify({
        message: "Error sending WhatsApp admin notification",
        error: error.message,
        code: error.code,
        stack: error.stack,
      }));
      throw error;
    }
  }

  // Verify webhook (for receiving messages)
  verifyWebhook(mode, token, challenge) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
      logger.info("WhatsApp webhook verified successfully");
      return challenge;
    } else {
      logger.error("WhatsApp webhook verification failed");
      return null;
    }
  }

  // Handle incoming webhook messages
  handleWebhook(body) {
    try {
      if (body.object === "whatsapp_business_account") {
        body.entry?.forEach((entry) => {
          entry.changes?.forEach((change) => {
            if (change.field === "messages") {
              const messages = change.value.messages;
              messages?.forEach((message) => {
                logger.info("Received WhatsApp message:", {
                  from: message.from,
                  text: message.text?.body,
                  timestamp: message.timestamp,
                });
                // Handle incoming message logic here
              });
            }
          });
        });
      }
      return true;
    } catch (error) {
      logger.error(JSON.stringify({
        message: "Error handling WhatsApp webhook",
        error: error.message,
        code: error.code,
        stack: error.stack,
      }));
      return false;
    }
  }
}

module.exports = new WhatsAppService();
