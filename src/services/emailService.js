const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    try {
      // Only create transporter if SMTP is configured
      // Use MAIL_USER and MAIL_PASS as primary, fallback to SMTP_USER and SMTP_PASS
      const mailUser = process.env.MAIL_USER || process.env.SMTP_USER;
      const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS;

      if (process.env.SMTP_HOST && mailUser && mailPass) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: mailUser,
            pass: mailPass,
          },
        });

        // Verify connection configuration (non-blocking, with error handling)
        try {
          this.transporter.verify((error, _success) => {
            if (error) {
              logger.error(
                JSON.stringify({
                  message: "SMTP connection error",
                  error: error.message,
                  code: error.code,
                })
              );
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
        logger.warn(
          "SMTP not configured - email functionality will be disabled"
        );
      }
    } catch (error) {
      // If email service initialization fails, continue without email
      this.transporter = null;
      logger.error(
        JSON.stringify({
          message: "Email service initialization failed",
          error: error.message,
        })
      );
    }
  }

  // Send inquiry confirmation email to user
  async sendInquiryConfirmation(inquiry) {
    if (!this.transporter) {
      logger.warn("Email service not configured, skipping confirmation email");
      return null;
    }

    try {
      const fromEmail =
        process.env.SMTP_FROM || process.env.MAIL_USER || process.env.SMTP_USER;
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "DataScube"}" <${fromEmail}>`,
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
      logger.error(
        JSON.stringify({
          message: "Error sending confirmation email",
          error: error.message,
          code: error.code,
          email: inquiry.email,
        })
      );
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

      const fromEmail =
        process.env.SMTP_FROM || process.env.MAIL_USER || process.env.SMTP_USER;
      const mailOptions = {
        from: `"${process.env.COMPANY_NAME || "DataScube"}" <${fromEmail}>`,
        to: adminEmail,
        subject: `New Inquiry Received - ${inquiry.inquiryType.toUpperCase()} - Priority: ${inquiry.priority.toUpperCase()}`,
        html: this.generateAdminNotificationTemplate(inquiry),
        text: this.generateAdminNotificationText(inquiry),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Admin notification sent: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Error sending admin notification",
          error: error.message,
          code: error.code,
          inquiryId: inquiry._id,
        })
      );
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
        <title>Thank You for Your Inquiry - DataScube Solutions</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f7fa; }
            .email-wrapper { width: 100%; background-color: #f5f7fa; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); }
            
            /* Header Styles */
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 25px; text-align: center; }
            .logo { max-width: 180px; height: auto; margin-bottom: 15px; background: white; padding: 12px; border-radius: 8px; }
            .header-title { color: #ffffff; font-size: 26px; font-weight: 600; margin: 15px 0 8px; letter-spacing: -0.5px; }
            .header-subtitle { color: rgba(255, 255, 255, 0.95); font-size: 15px; font-weight: 400; }
            
            /* Content Styles */
            .content { padding: 30px 28px; }
            .greeting { font-size: 17px; color: #2d3748; margin-bottom: 15px; font-weight: 500; }
            .intro-text { color: #4a5568; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
            
            /* Inquiry Details Card */
            .inquiry-card { background: linear-gradient(to bottom, #f7fafc, #ffffff); border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; }
            .card-title { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea; }
            .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; min-width: 130px; color: #4a5568; font-size: 14px; }
            .detail-value { color: #2d3748; font-size: 14px; flex: 1; }
            
            /* Status Badges */
            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .priority-low { background-color: #d1fae5; color: #065f46; }
            .priority-medium { background-color: #fef3c7; color: #92400e; }
            .priority-high { background-color: #fed7d7; color: #9b2c2c; }
            .priority-urgent { background-color: #fecaca; color: #7f1d1d; }
            
            /* Message Box */
            .message-box { background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; border-radius: 6px; margin: 18px 0; }
            .message-title { font-weight: 600; color: #0c4a6e; margin-bottom: 8px; font-size: 13px; }
            .message-text { color: #075985; font-size: 13px; line-height: 1.5; }
            
            /* Next Steps */
            .next-steps { margin: 20px 0; }
            .next-steps-title { font-size: 16px; font-weight: 600; color: #2d3748; margin-bottom: 12px; }
            .steps-list { list-style: none; padding: 0; }
            .steps-list li { padding: 8px 0 8px 28px; color: #4a5568; font-size: 13px; position: relative; }
            .steps-list li:before { content: "✓"; position: absolute; left: 0; color: #667eea; font-weight: bold; font-size: 15px; }
            
            /* CTA Button */
            .cta-section { text-align: center; margin: 25px 0; padding: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
            .cta-button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s; }
            .cta-button:hover { box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5); transform: translateY(-2px); }
            
            /* Footer */
            .footer { background-color: #1a202c; color: #cbd5e0; padding: 25px 25px; text-align: center; }
            .footer-text { font-size: 13px; line-height: 1.6; margin: 6px 0; }
            .footer-link { color: #667eea; text-decoration: none; font-weight: 500; }
            .footer-link:hover { color: #764ba2; }
            .social-links { margin: 20px 0; }
            .social-links a { color: #cbd5e0; margin: 0 10px; text-decoration: none; font-size: 13px; }
            .copyright { margin-top: 20px; padding-top: 20px; border-top: 1px solid #2d3748; font-size: 12px; color: #a0aec0; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <img src="${process.env.LOGO_URL || "https://res.cloudinary.com/nikul/image/upload/v1763274278/datascube/logo.png"}" alt="DataScube Solutions" class="logo">
                    <h1 class="header-title">Thank You for Reaching Out!</h1>
                    <p class="header-subtitle">We've received your inquiry and our team will respond shortly</p>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <p class="greeting">Hello ${inquiry.name},</p>
                    
                    <p class="intro-text">Thank you for contacting DataScube Solutions. We have successfully received your inquiry and our expert team will review it carefully. We typically respond within 24 hours during business days.</p>
                    
                    <div class="inquiry-card">
                        <div class="card-title">📋 Inquiry Summary</div>
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
                        <span class="detail-value">${this.formatDate(inquiry.createdAt)}</span>
                    </div>
                </div>
                
                <div class="message-box">
                    <h4 style="margin-top: 0;">Your Message:</h4>
                    <p style="margin-bottom: 0;">${inquiry.message}</p>
                </div>
                
                    <!-- Next Steps -->
                    <div class="next-steps">
                        <h3 class="next-steps-title">What Happens Next?</h3>
                        <ul class="steps-list">
                            <li>Our team will review your inquiry within 24 hours</li>
                            <li>You'll receive updates via email at datascubesolutions@gmail.com</li>
                            <li>A dedicated specialist will be assigned to your case</li>
                            <li>For urgent matters, call us at +91 73003 40014</li>
                        </ul>
                    </div>
                    
                    <!-- CTA Button -->
                    <div class="cta-section">
                        <p style="color: #4a5568; margin-bottom: 15px; font-size: 13px;">Want to learn more about our solutions?</p>
                        <a href="https://data-scube-solutions-git-k-detail-t-6278ab-data-scubes-projects.vercel.app" class="cta-button" style="color: #ffffff !important;">Visit Our Website</a>
                    </div>
                    
                    <p style="color: #718096; font-size: 13px; margin-top: 20px;">If you have any additional information or questions, please don't hesitate to reach out to us at <a href="mailto:datascubesolutions@gmail.com" style="color: #667eea; text-decoration: none;">datascubesolutions@gmail.com</a></p>
                    
                    <p style="color: #2d3748; font-size: 13px; margin-top: 18px;">Best regards,<br><strong style="color: #667eea;">DataScube Solutions Team</strong></p>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p class="footer-text"><strong>DataScube Solutions</strong></p>
                    <p class="footer-text">Innovative Technology Solutions for Modern Businesses</p>
                    <p class="footer-text" style="margin-top: 12px;">
                        Email: <a href="mailto:datascubesolutions@gmail.com" class="footer-link">datascubesolutions@gmail.com</a><br>
                        Phone: <a href="tel:+917300340014" class="footer-link">+91 73003 40014</a>
                    </p>
                    <div class="social-links">
                        <a href="https://data-scube-solutions-git-k-detail-t-6278ab-data-scubes-projects.vercel.app">Website</a> |
                        <a href="#">LinkedIn</a> |
                        <a href="#">Twitter</a>
                    </div>
                    <div class="copyright">
                        &copy; ${new Date().getFullYear()} DataScube Solutions. All rights reserved.
                    </div>
                </div>
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
- Submitted: ${this.formatDate(inquiry.createdAt)}

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
                <div class="detail"><span class="label">Submitted:</span> ${this.formatDate(inquiry.createdAt)}</div>
                
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
Submitted: ${this.formatDate(inquiry.createdAt)}

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

  // Format date as "16-Nov-2025 12:14 PM"
  formatDate(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }
}

module.exports = new EmailService();
