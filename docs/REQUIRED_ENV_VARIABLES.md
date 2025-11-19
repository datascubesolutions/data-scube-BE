# Required Environment Variables for Production

## Email Configuration (Required for email functionality)

```bash
# Gmail credentials
MAIL_USER=datascubesolutions@gmail.com
MAIL_PASS=qfpn rssz deth nnrm

# Admin email for notifications
ADMIN_EMAIL=nikulkumar730@gmail.com

# Company information (used in email templates)
COMPANY_NAME=DataScube Solutions
COMPANY_EMAIL=datascubesolutions@gmail.com
COMPANY_PHONE=+91 73003 40014

# Logo URL for emails
LOGO_URL=https://res.cloudinary.com/nikul/image/upload/v1763274278/datascube/logo.png
```

## Current Server Environment Issues

Based on your server logs, you're missing these variables:

1. **ADMIN_EMAIL** - This is why you see "Admin email not configured, skipping notification"
2. **COMPANY_NAME** - Used in email subject and body
3. **COMPANY_EMAIL** - Used in email footer
4. **COMPANY_PHONE** - Used in email footer
5. **LOGO_URL** - Used for company logo in emails

## Variables You Already Have (Good!)

✅ MAIL*USER=datascubesolutions@gmail.com
✅ MAIL_PASS=qfpn rssz deth nnrm
✅ MONGODB_URI
✅ CLOUDINARY*_ variables
✅ WHATSAPP\__ variables

## Old Variables to Remove (Optional cleanup)

These are no longer needed since we switched to Gmail service:

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- FROM_EMAIL

## How to Add Missing Variables

### On Render.com:

1. Go to your service dashboard
2. Click "Environment" tab
3. Add each missing variable
4. Click "Save Changes"
5. Service will automatically redeploy

### On Vercel:

1. Go to Project Settings
2. Click "Environment Variables"
3. Add each missing variable
4. Redeploy your application

## Testing Email After Adding Variables

Once you've added all variables, test with:

```bash
curl -X POST https://your-api-url/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Inquiry",
    "message": "Testing email functionality",
    "inquiryType": "general",
    "source": "website"
  }'
```

Check your logs for:

- ✅ "Gmail service is ready to send messages from datascubesolutions@gmail.com"
- ✅ "Confirmation email sent for inquiry..."
- ✅ "Admin notification sent for inquiry..."

## Troubleshooting

If emails still don't work:

1. **Check Gmail App Password**: Make sure `qfpn rssz deth nnrm` is still valid
2. **Check Gmail Account**: Ensure 2FA is enabled and app password is active
3. **Check Logs**: Look for "Gmail connection error" messages
4. **Verify Variables**: All variables should be set without quotes in Render/Vercel
