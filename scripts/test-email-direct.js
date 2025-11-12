#!/usr/bin/env node

require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmailDirect() {
  console.log("📧 Testing Email Service Directly\n");

  console.log("📝 SMTP Configuration:");
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  From: ${process.env.SMTP_FROM || process.env.SMTP_USER}`);
  console.log(`  Admin Email: ${process.env.ADMIN_EMAIL}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("⏳ Verifying SMTP connection...\n");

  try {
    // Verify connection
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!\n");

    // Test email to Ritika
    console.log("📤 Sending test email to createwithritika@gmail.com...\n");

    const mailOptions = {
      from: `"DataScube Test" <${process.env.SMTP_USER}>`,
      to: "createwithritika@gmail.com",
      subject: "Test Email - DataScube Inquiry Confirmation",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background-color: white; padding: 30px; border-radius: 0 0 10px 10px; }
                .detail-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Thank You for Your Inquiry!</h1>
                    <p>We've received your message and will get back to you soon</p>
                </div>
                
                <div class="content">
                    <p>Dear Ritika,</p>
                    
                    <p>Thank you for reaching out to DataScube! We have successfully received your inquiry about product integration.</p>
                    
                    <div class="detail-box">
                        <h3 style="margin-top: 0; color: #667eea;">Inquiry Details</h3>
                        <p><strong>Subject:</strong> Product Integration Inquiry</p>
                        <p><strong>Type:</strong> Sales</p>
                        <p><strong>Priority:</strong> Medium</p>
                        <p><strong>Company:</strong> Tech Solutions Inc</p>
                    </div>
                    
                    <p><strong>Your Message:</strong></p>
                    <p style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3;">
                        I am interested in integrating your DataScube solution with our existing infrastructure. 
                        Could you please provide more information about the API capabilities and pricing?
                    </p>
                    
                    <h3>What happens next?</h3>
                    <ul>
                        <li>✅ Our team will review your inquiry within 24 hours</li>
                        <li>📧 You'll receive updates via email</li>
                        <li>📞 For urgent matters, call us at +91 73003 40014</li>
                    </ul>
                    
                    <p>Best regards,<br>
                    <strong>DataScube Team</strong></p>
                </div>
                
                <div class="footer">
                    <p>&copy; 2024 DataScube. All rights reserved.</p>
                    <p>Email: info@datascube.com | Phone: +91 73003 40014</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
Dear Ritika,

Thank you for contacting DataScube!

We have received your inquiry about product integration.

Inquiry Details:
- Subject: Product Integration Inquiry
- Type: Sales
- Priority: Medium
- Company: Tech Solutions Inc

Your Message:
I am interested in integrating your DataScube solution with our existing infrastructure. 
Could you please provide more information about the API capabilities and pricing?

What happens next?
- Our team will review your inquiry within 24 hours
- You'll receive updates via email
- For urgent matters, call us at +91 73003 40014

Best regards,
DataScube Team

Email: info@datascube.com
Phone: +91 73003 40014
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!\n");
    console.log("📊 Email Details:");
    console.log(`  Message ID: ${result.messageId}`);
    console.log(`  Response: ${result.response}`);
    console.log(`  Accepted: ${result.accepted.join(", ")}`);
    if (result.rejected.length > 0) {
      console.log(`  Rejected: ${result.rejected.join(", ")}`);
    }

    console.log("\n💡 Next Steps:");
    console.log("1. Check createwithritika@gmail.com inbox");
    console.log("2. Check spam/junk folder if not in inbox");
    console.log("3. Email should arrive within 1-2 minutes");
    console.log(
      '4. Look for subject: "Test Email - DataScube Inquiry Confirmation"'
    );

    console.log("\n✅ Email test completed successfully!");
  } catch (error) {
    console.error("❌ Email test failed:");
    console.error("Error:", error.message);

    if (error.code === "EAUTH") {
      console.log("\n💡 Authentication Error - Possible solutions:");
      console.log("1. Check SMTP_USER and SMTP_PASS in .env file");
      console.log('2. Enable "Less secure app access" in Gmail settings');
      console.log("3. Use App Password instead of regular password");
      console.log("4. Check if 2FA is enabled (requires App Password)");
    } else if (error.code === "ECONNECTION") {
      console.log("\n💡 Connection Error - Possible solutions:");
      console.log("1. Check internet connection");
      console.log("2. Verify SMTP_HOST and SMTP_PORT");
      console.log("3. Check firewall settings");
    }
  }
}

// Run the test
testEmailDirect();
