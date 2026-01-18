# eBay Marketplace Account Deletion Webhook Handler

This server handles eBay Marketplace Account Deletion notifications as required by eBay's Developer Program. All developers must either subscribe to these notifications or opt out if they don't store eBay user data.

## 📋 Overview

When an eBay user requests deletion of their personal data, eBay sends notifications to all registered third-party applications. This webhook handler:

1. ✅ Responds to eBay's challenge code validation (GET request)
2. ✅ Receives account deletion notifications (POST request)
3. ✅ Acknowledges notifications immediately (HTTP 200)
4. 🔒 Verifies notification signatures (optional but recommended)
5. 🗑️ Processes user data deletion

## 🚀 Quick Start

### Prerequisites

- Node.js 14 or higher
- npm or yarn
- A publicly accessible HTTPS endpoint (required by eBay)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update configuration in `server.js`:**
   ```javascript
   const VERIFICATION_TOKEN = 'ebay_verification_token_2026_n8n_prod';
   const ENDPOINT_URL = 'https://n8n.srv839866.hstgr.cloud/webhook/ebay';
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Test locally:**
   ```bash
   npm test
   ```

## 🔧 Configuration

### In your code (server.js)

Update these values to match your eBay Developer Portal settings:

```javascript
const VERIFICATION_TOKEN = 'your_verification_token_here';
const ENDPOINT_URL = 'https://your-domain.com/webhook/ebay';
```

### In eBay Developer Portal

1. Sign in to [eBay Developer Portal](https://developer.ebay.com/)
2. Go to **Alerts & Notifications**
3. Select **Marketplace Account Deletion**
4. Enter:
   - **Email**: Your notification email
   - **Endpoint URL**: `https://your-domain.com/webhook/ebay`
   - **Verification Token**: Same as in your code (32-80 chars, alphanumeric, `-`, `_`)
5. Click **Save**

eBay will immediately send a GET request with a challenge code. Your server must respond correctly to pass validation.

## 📝 How It Works

### 1. Challenge Code Validation (Initial Setup)

When you save your endpoint in eBay Developer Portal:

```
eBay sends: GET https://your-endpoint.com/webhook/ebay?challenge_code=abc123

Your server calculates:
  hash = SHA256(challengeCode + verificationToken + endpointURL)

Your server responds:
  {
    "challengeResponse": "calculated_hash_value"
  }
```

### 2. Receiving Notifications

When a user requests account deletion:

```
eBay sends: POST https://your-endpoint.com/webhook/ebay
Headers: x-ebay-signature: <signature>
Body: {
  "metadata": {
    "topic": "MARKETPLACE_ACCOUNT_DELETION",
    "schemaVersion": "1.0"
  },
  "notification": {
    "notificationId": "uuid",
    "eventDate": "2026-01-19T12:00:00.000Z",
    "data": {
      "username": "user123",
      "userId": "U1234567",
      "eiasToken": "token_value"
    }
  }
}

Your server must:
1. Immediately respond with HTTP 200
2. Verify the signature (optional but recommended)
3. Delete the user's data from your systems
```

## 🔒 Security - Signature Verification

For production, implement signature verification using eBay's SDK:

```bash
npm install @ebay/event-notification-nodejs-sdk
```

Or manually verify using eBay's [Notification API](https://developer.ebay.com/api-docs/commerce/notification/overview.html).

## 💾 Implementing Data Deletion

**IMPORTANT**: Update the `deleteUserData()` function in `server.js` with your actual deletion logic:

```javascript
async function deleteUserData(userData) {
    // Example implementation:
    
    // 1. Delete from database
    await db.users.deleteMany({ ebayUserId: userData.userId });
    await db.orders.deleteMany({ ebayUserId: userData.userId });
    
    // 2. Clear caches
    await redis.del(`user:${userData.userId}`);
    
    // 3. Remove from third-party services
    await analyticsService.deleteUser(userData.userId);
    
    // 4. Log the deletion (keep minimal audit trail if required)
    await auditLog.create({
        action: 'USER_DELETED',
        userId: userData.userId,
        timestamp: new Date()
    });
}
```

## 🧪 Testing

### Test Challenge Response Calculation

```bash
npm test
```

### Test with curl

```bash
# Test challenge code
curl "http://localhost:3000/webhook/ebay?challenge_code=test123"

# Test health check
curl http://localhost:3000/health
```

### Test with eBay's "Send Test Notification"

1. Go to eBay Developer Portal → Alerts & Notifications
2. Click **Send Test Notification**
3. Check your server logs to see the test notification

## 🚨 Troubleshooting

### "Marketplace account deletion endpoint validation failed"

**Causes:**
- ✗ Verification token mismatch between code and portal
- ✗ Endpoint URL mismatch between code and portal
- ✗ Server not running or not accessible
- ✗ Not using HTTPS (required by eBay)
- ✗ Response format incorrect (must be valid JSON with Content-Type: application/json)
- ✗ Response includes BOM (Byte Order Mark) - use JSON library to create response

**Solutions:**
1. Verify your server is running and accessible via HTTPS
2. Double-check VERIFICATION_TOKEN matches exactly
3. Double-check ENDPOINT_URL matches exactly (including path)
4. Test locally first: `curl "http://localhost:3000/webhook/ebay?challenge_code=test123"`
5. Check server logs for errors
6. Ensure response is pure JSON (no BOM)

### Receiving duplicate notifications

If you receive the same notification multiple times:
- Your server is not acknowledging properly (must return 200/201/202/204)
- Check that `res.status(200).send()` is executing
- Verify no errors are preventing the response

### Endpoint marked down by eBay

If eBay marks your endpoint as down:
1. Check server logs for errors
2. Verify endpoint is accessible and responding
3. Use **Send Test Notification** to test
4. Contact eBay support to reactivate once fixed

## 📚 Resources

- [eBay Marketplace Account Deletion Documentation](https://developer.ebay.com/develop/guides-v2/marketplace-user-account-deletion/marketplace-user-account-deletion)
- [eBay Notification API](https://developer.ebay.com/api-docs/commerce/notification/overview.html)
- [Event Notification SDK (Node.js)](https://github.com/eBay/event-notification-nodejs-sdk)

## ⚠️ Important Notes

1. **Compliance Required**: All eBay developers must subscribe or opt out. Failure to comply results in API access termination.

2. **30-Day Response**: If your endpoint is marked down, you have 30 days to fix it before being marked non-compliant.

3. **Data Deletion**: You must delete user data unless you have specific legal requirements to retain it (e.g., tax, AML regulations).

4. **HTTPS Required**: eBay only accepts HTTPS endpoints (no HTTP).

5. **No Localhost**: Endpoint cannot contain internal IP addresses or 'localhost'.

6. **Expected Volume**: Be prepared to handle up to 1,500 notifications per day (varies based on your app usage).

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues or pull requests to improve this webhook handler.
