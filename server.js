const express = require('express');
const crypto = require('crypto');
const app = express();

// Configuration - UPDATE THESE VALUES
const VERIFICATION_TOKEN = 'ebay_verification_token_2026_n8n_prod';
const ENDPOINT_URL = 'https://n8n.srv839866.hstgr.cloud/webhook/ebay';
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * GET endpoint - Handles eBay's challenge code validation
 * This is called when you first save your endpoint in the eBay Developer Portal
 */
app.get('/webhook/ebay', (req, res) => {
    const challengeCode = req.query.challenge_code;
    
    if (!challengeCode) {
        return res.status(400).json({ error: 'Missing challenge_code parameter' });
    }
    
    console.log('Received challenge code:', challengeCode);
    
    // Hash the challenge code, verification token, and endpoint URL
    // Order matters: challengeCode + verificationToken + endpoint
    const hash = crypto.createHash('sha256');
    hash.update(challengeCode);
    hash.update(VERIFICATION_TOKEN);
    hash.update(ENDPOINT_URL);
    const challengeResponse = hash.digest('hex');
    
    console.log('Sending challenge response:', challengeResponse);
    
    // Return the response in the required format
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        challengeResponse: challengeResponse
    });
});

/**
 * POST endpoint - Handles actual marketplace account deletion notifications
 */
app.post('/webhook/ebay', async (req, res) => {
    console.log('\n=== Received eBay Account Deletion Notification ===');
    
    // Immediately acknowledge receipt (required by eBay)
    res.status(200).send();
    
    try {
        const notification = req.body;
        const signature = req.headers['x-ebay-signature'];
        
        console.log('Notification ID:', notification?.notification?.notificationId);
        console.log('Topic:', notification?.metadata?.topic);
        console.log('Event Date:', notification?.notification?.eventDate);
        
        // Extract user data
        const userData = notification?.notification?.data;
        if (userData) {
            console.log('User Data:');
            console.log('  - Username:', userData.username);
            console.log('  - User ID:', userData.userId);
            console.log('  - EIAS Token:', userData.eiasToken);
            
            // TODO: Implement your user data deletion logic here
            // This is where you would delete the user's data from your database
            await deleteUserData(userData);
        }
        
        // Optional: Verify the signature (recommended for production)
        if (signature) {
            const isValid = await verifySignature(signature, req.body);
            console.log('Signature valid:', isValid);
        }
        
    } catch (error) {
        console.error('Error processing notification:', error);
    }
});

/**
 * Verify the eBay notification signature
 * In production, you should implement this using eBay's SDK or the manual process
 */
async function verifySignature(signature, payload) {
    // For now, return true. In production, implement proper signature verification
    // See: https://developer.ebay.com/develop/guides-v2/marketplace-user-account-deletion/marketplace-user-account-deletion#verifying-the-validity-of-an-ebay-marketplace-account-deletion/closure-notification
    
    // You can use eBay's Event Notification SDK for this:
    // - Event Notification SDK (Node.js): https://github.com/eBay/event-notification-nodejs-sdk
    
    return true;
}

/**
 * Delete user data from your systems
 * IMPORTANT: Implement your actual data deletion logic here
 */
async function deleteUserData(userData) {
    console.log('\n=== DELETING USER DATA ===');
    console.log('Deleting data for user:', userData.userId);
    
    // TODO: Implement your data deletion logic
    // Examples:
    // - Delete user records from database
    // - Remove stored preferences
    // - Delete cached data
    // - Remove any stored personal information
    
    // Example pseudo-code:
    // await db.users.delete({ ebayUserId: userData.userId });
    // await db.orders.delete({ ebayUserId: userData.userId });
    // await cache.clear(userData.userId);
    
    console.log('User data deletion completed for:', userData.userId);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
    console.log(`eBay Webhook Server running on port ${PORT}`);
    console.log(`Endpoint URL: ${ENDPOINT_URL}`);
    console.log(`\nConfiguration:`);
    console.log(`  - Verification Token: ${VERIFICATION_TOKEN}`);
    console.log(`  - Endpoint: ${ENDPOINT_URL}`);
    console.log(`\nWaiting for eBay notifications...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
