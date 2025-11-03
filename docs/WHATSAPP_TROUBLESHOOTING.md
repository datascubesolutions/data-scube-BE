# WhatsApp Integration Troubleshooting

## Issue: API Success but No Message Delivery

### Quick Checks

1. **Verify Phone Number Status**
   - Go to Meta Business Manager > WhatsApp Manager
   - Check if business number is "Verified" (green checkmark)
   - Complete phone verification if pending

2. **Add Test Phone Numbers**
   - In WhatsApp Manager, go to "Phone numbers" tab
   - Add your test phone number to the approved list
   - This is required during development phase

3. **Check Message Templates**
   - Templates must be approved before use
   - Use simple text messages for testing instead

4. **Verify Webhook Setup**
   - Webhook must be configured for two-way messaging
   - Check webhook URL is accessible and verified

### Testing Steps

1. **Test with Simple Text Message**

   ```bash
   curl -X POST http://localhost:3000/api/test-whatsapp/send-test \
     -H "Content-Type: application/json" \
     -d '{
       "phoneNumber": "917300340014",
       "message": "Simple test message"
     }'
   ```

2. **Check WhatsApp Manager Logs**
   - Go to WhatsApp Manager > Insights
   - Check message delivery status

3. **Verify Access Token**
   - Ensure token has proper permissions
   - Token should have `whatsapp_business_messaging` permission

### Common Solutions

- **Add phone to test numbers list**
- **Use verified business number only**
- **Avoid template messages during testing**
- **Check rate limits (1000 messages/day for unverified)**
