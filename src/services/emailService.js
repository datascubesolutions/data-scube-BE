const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    try {
      // Only create transporter if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        // Verify connection configuration (non-blocking, with error handling)
        try {
          this.transporter.verify((error, _success) => {
            if (error) {
              logger.error(JSON.stringify({ message: "SMTP connection error", error: error.message, code: error.code }));
            } else {
              logger.info("SMTP server is ready to take our messages");
            }
          });
        } catch (verifyError) {
          // If verification fails, continue anyway
          logger.warn("SMTP verification failed, but service will continue");
        }
      } else {
        this.transporter = null;
        logger.warn("SMTP not configured - email functionality will be disabled");
      }
    } catch (error) {
      // If email service initialization fails, continue without email
      this.transporter = null;
      logger.error(JSON.stringify({ message: "Email service initialization failed", error: error.message }));
    }
  }

  // Send inquiry confirmation email to user
  async sendInquiryConfirmation(inquiry) {
    if (!this.transporter) {
      logger.warn("Email service not configured, skipping confirmation email");
      return null;
    }
    
    try {
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "DataScube"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: inquiry.email,
        subject: `Thank you for contacting us - Inquiry #${inquiry._id.toString().slice(-6)}`,
        html: this.generateConfirmationEmailTemplate(inquiry),
        text: this.generateConfirmationEmailText(inquiry),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(
        `Confirmation email sent to ${inquiry.email}: ${result.messageId}`
      );
      return result;
    } catch (error) {
      logger.error(JSON.stringify({ message: "Error sending confirmation email", error: error.message, code: error.code, email: inquiry.email }));
      throw error;
    }
  }

  // Send notification to admin
  async sendAdminNotification(inquiry) {
    if (!this.transporter) {
      logger.warn("Email service not configured, skipping admin notification");
      return null;
    }
    
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        logger.warn("Admin email not configured, skipping notification");
        return null;
      }

      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "DataScube"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Inquiry Received - ${inquiry.inquiryType.toUpperCase()} - Priority: ${inquiry.priority.toUpperCase()}`,
        html: this.generateAdminNotificationTemplate(inquiry),
        text: this.generateAdminNotificationText(inquiry),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Admin notification sent: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error(JSON.stringify({ message: "Error sending admin notification", error: error.message, code: error.code, inquiryId: inquiry._id }));
      throw error;
    }
  }

  // Generate beautiful HTML template for confirmation email
  generateConfirmationEmailTemplate(inquiry) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Your Inquiry</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
            .content { padding: 40px 30px; }
            .inquiry-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .detail-label { font-weight: bold; min-width: 120px; color: #555; }
            .detail-value { color: #333; }
            .message-box { background-color: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
            .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
            .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .priority-${inquiry.priority} { background-color: ${this.getPriorityColor(inquiry.priority)}; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Thank You for Contacting Us!</h1>
                <p>We've received your inquiry and will get back to you soon</p>
            </div>
            
            <div class="content">
                <p>Dear ${inquiry.name},</p>
                
                <p>Thank you for reaching out to us. We have successfully received your inquiry and our team will review it shortly. Here are the details of your submission:</p>
                
                <div class="inquiry-details">
                    <h3 style="margin-top: 0; color: #667eea;">Inquiry Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Inquiry ID:</span>
                        <span class="detail-value">#${inquiry._id.toString().slice(-6)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Subject:</span>
                        <span class="detail-value">${inquiry.subject}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value">${inquiry.inquiryType.charAt(0).toUpperCase() + inquiry.inquiryType.slice(1)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Priority:</span>
                        <span class="detail-value">
                            <span class="status-badge priority-${inquiry.priority}">${inquiry.priority}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">
                            <span class="status-badge status-pending">${inquiry.status}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${new Date(inquiry.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="message-box">
                    <h4 style="margin-top: 0;">Your Message:</h4>
                    <p style="margin-bottom: 0;">${inquiry.message}</p>
                </div>
                
                <h3>What happens next?</h3>
                <ul>
                    <li>Our team will review your inquiry within 24 hours</li>
                    <li>You'll receive updates via email at ${inquiry.email}</li>
                    <li>For urgent matters, you can call us at ${process.env.COMPANY_PHONE || "+1 (555) 123-4567"}</li>
                </ul>
                
                <p>If you have any additional information or questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                <strong>${process.env.COMPANY_NAME || "DataScube"} Team</strong></p>
            </div>
            
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || "DataScube"}. All rights reserved.</p>
                <p>${process.env.COMPANY_ADDRESS || "Your Company Address"}</p>
                <p>Email: ${process.env.COMPANY_EMAIL || "info@datascube.com"} | Phone: ${process.env.COMPANY_PHONE || "+1 (555) 123-4567"}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate plain text version
  generateConfirmationEmailText(inquiry) {
    return `
Dear ${inquiry.name},

Thank you for contacting ${process.env.COMPANY_NAME || "DataScube"}!

We have received your inquiry and will get back to you soon.

Inquiry Details:
- ID: #${inquiry._id.toString().slice(-6)}
- Subject: ${inquiry.subject}
- Type: ${inquiry.inquiryType}
- Priority: ${inquiry.priority}
- Status: ${inquiry.status}
- Submitted: ${new Date(inquiry.createdAt).toLocaleString()}

Your Message:
${inquiry.message}

What happens next?
- Our team will review your inquiry within 24 hours
- You'll receive updates via email at ${inquiry.email}
- For urgent matters, call us at ${process.env.COMPANY_PHONE || "+1 (555) 123-4567"}

Best regards,
${process.env.COMPANY_NAME || "DataScube"} Team

${process.env.COMPANY_EMAIL || "info@datascube.com"}
${process.env.COMPANY_PHONE || "+1 (555) 123-4567"}
    `;
  }

  // Generate admin notification template
  generateAdminNotificationTemplate(inquiry) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; }
            .priority-${inquiry.priority} { color: ${this.getPriorityTextColor(inquiry.priority)}; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Inquiry Alert</h2>
            </div>
            <div class="content">
                <div class="detail"><span class="label">ID:</span> #${inquiry._id.toString().slice(-6)}</div>
                <div class="detail"><span class="label">Name:</span> ${inquiry.name}</div>
                <div class="detail"><span class="label">Email:</span> ${inquiry.email}</div>
                <div class="detail"><span class="label">Phone:</span> ${inquiry.phone || "Not provided"}</div>
                <div class="detail"><span class="label">Company:</span> ${inquiry.company || "Not provided"}</div>
                <div class="detail"><span class="label">Subject:</span> ${inquiry.subject}</div>
                <div class="detail"><span class="label">Type:</span> ${inquiry.inquiryType}</div>
                <div class="detail"><span class="label">Priority:</span> <span class="priority-${inquiry.priority}">${inquiry.priority.toUpperCase()}</span></div>
                <div class="detail"><span class="label">Source:</span> ${inquiry.source}</div>
                <div class="detail"><span class="label">IP Address:</span> ${inquiry.ipAddress || "Unknown"}</div>
                <div class="detail"><span class="label">Submitted:</span> ${new Date(inquiry.createdAt).toLocaleString()}</div>
                
                <h3>Message:</h3>
                <p style="background-color: white; padding: 15px; border-left: 4px solid #007bff;">${inquiry.message}</p>
                
                <p><strong>Action Required:</strong> Please review and respond to this inquiry promptly.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  generateAdminNotificationText(inquiry) {
    return `
New Inquiry Alert - ${process.env.COMPANY_NAME || "DataScube"}

ID: #${inquiry._id.toString().slice(-6)}
Name: ${inquiry.name}
Email: ${inquiry.email}
Phone: ${inquiry.phone || "Not provided"}
Company: ${inquiry.company || "Not provided"}
Subject: ${inquiry.subject}
Type: ${inquiry.inquiryType}
Priority: ${inquiry.priority.toUpperCase()}
Source: ${inquiry.source}
IP Address: ${inquiry.ipAddress || "Unknown"}
Submitted: ${new Date(inquiry.createdAt).toLocaleString()}

Message:
${inquiry.message}

Action Required: Please review and respond to this inquiry promptly.
    `;
  }

  getPriorityColor(priority) {
    const colors = {
      low: "#28a745",
      medium: "#ffc107",
      high: "#fd7e14",
      urgent: "#dc3545",
    };
    return colors[priority] || "#6c757d";
  }

  getPriorityTextColor(priority) {
    const colors = {
      low: "#28a745",
      medium: "#856404",
      high: "#fd7e14",
      urgent: "#dc3545",
    };
    return colors[priority] || "#6c757d";
  }
}

module.exports = new EmailService();
