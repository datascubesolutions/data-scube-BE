# Render Environment Variables Setup

## ✅ Variables You Already Have (Keep These)

```
MAIL_USER=datascubesolutions@gmail.com
MAIL_PASS=qfpn rssz deth nnrm
MONGODB_URI=mongodb+srv://nikul:nikul@datascube.7fholtw.mongodb.net/datascube?retryWrites=true&w=majority&appName=dataScube
CLOUDINARY_CLOUD_NAME=nikul
CLOUDINARY_API_KEY=729245361862254
CLOUDINARY_API_SECRET=QLi3G-Du8HvHKvhxWPeYHdwCXMM
WHATSAPP_ACCESS_TOKEN=EAAKtR8rbYiEBP9rwmfEQjMieeyLZAIORSYkVHQuMjCdnxj5uOyuljC4X3aOmuZBqZCFKlpMSlc3AEGsTBBLc6k6pbg6F36J7fNbXLSbRChv0hHqvho7aMiQwwUzsQzy47hVSwrlorNzFPODnkh1hJ8ogZC7jRa3PQ3hfBZAT5UMIy9COgp0tlTjIMTKdQTzNishLYh3bFjNwyConBDOFYFtPov5ZBw0bNdAa8bAtMP3qSunhP8sL6lHAh41565NqcYmvV1pWETmVEErpN4r1qmlLWS
WHATSAPP_PHONE_NUMBER_ID=840038685859111
WHATSAPP_VERIFY_TOKEN=datascube_webhook_2024_secure
NODE_ENV=development
PORT=3000
```

## ⚠️ MISSING Variables - ADD THESE TO RENDER NOW

**These are required for emails to work:**

```
ADMIN_EMAIL=nikulkumar730@gmail.com
COMPANY_NAME=DataScube Solutions
COMPANY_EMAIL=datascubesolutions@gmail.com
COMPANY_PHONE=+91 73003 40014
LOGO_URL=https://res.cloudinary.com/nikul/image/upload/v1763274278/datascube/logo.png
```

## 🗑️ OLD Variables - Can Be Removed (Optional)

These are no longer needed since we use Gmail service directly:

```
SMTP_HOST (remove)
SMTP_PORT (remove)
SMTP_USER (remove)
SMTP_PASS (remove)
FROM_EMAIL (remove)
```

## 📋 How to Add Variables on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your service**: Click on your backend service
3. **Click "Environment" tab** in the left sidebar
4. **Add each missing variable**:
   - Click "Add Environment Variable"
   - Enter Key: `ADMIN_EMAIL`
   - Enter Value: `nikulkumar730@gmail.com`
   - Click "Save"
   - Repeat for all 5 missing variables
5. **Save Changes**: Click "Save Changes" button at bottom
6. **Render will automatically redeploy** your service

## ✅ Verification

After adding variables and redeploying, check your logs for:

```
✅ Email service initializing with user: dat***
✅ Gmail service is ready to send messages from datascubesolutions@gmail.com
```

When someone submits an inquiry, you should see:

```
✅ Confirmation email sent for inquiry [id]
✅ Admin notification sent for inquiry [id]
```

## 🧪 Test Email After Setup

Run this command to test (replace with your Render URL):

```bash
curl -X POST https://your-app.onrender.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Email",
    "message": "Testing email after env setup",
    "inquiryType": "general",
    "source": "website"
  }'
```

You should receive:

1. Confirmation email to `test@example.com`
2. Admin notification to `nikulkumar730@gmail.com`

## 🔧 Troubleshooting

If emails still don't work after adding variables:

1. **Check Render Logs**: Look for email-related errors
2. **Verify Gmail App Password**: Ensure `qfpn rssz deth nnrm` is still valid
3. **Check Gmail Account**:
   - Go to https://myaccount.google.com/security
   - Ensure 2-Step Verification is ON
   - Check App Passwords section
4. **Run verification script**: `node scripts/verify-email-env.js`

## 📞 Support

If you still have issues, check:

- Render logs for specific error messages
- Gmail account for any security alerts
- That all 5 missing variables are added correctly (no typos)

## ⚠️ IMPORTANT: Render Free Tier SMTP Limitations

**The connection timeout errors you're seeing are caused by Render's free tier blocking/throttling SMTP connections.**

### Why This Happens:

- Render free tier restricts outbound SMTP to prevent spam
- Gmail SMTP (port 587) connections may timeout
- This is NOT a code issue - it's a Render platform limitation

### Solutions (Choose One):

#### Option 1: Upgrade Render Plan (Recommended)

- Upgrade to Render's paid plan ($7/month)
- Removes SMTP restrictions
- Most reliable solution

#### Option 2: Use SendGrid (Free Alternative)

- Free tier: 100 emails/day
- Sign up: https://sendgrid.com
- Get API key
- No SMTP needed (uses HTTP API)

#### Option 3: Use Mailgun

- Free tier: 5,000 emails/month
- Sign up: https://www.mailgun.com
- More generous free tier

#### Option 4: Use AWS SES

- Free tier: 62,000 emails/month
- Requires AWS account
- Most scalable option

### Current Code Status:

✅ Code has retry logic (2 attempts per email)
✅ Code has connection pooling
✅ Code has proper timeout handling
✅ Code will work once SMTP restrictions are removed

The issue is **infrastructure**, not code.
