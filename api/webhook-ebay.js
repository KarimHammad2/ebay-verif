const crypto = require('crypto');

// Configuration - UPDATE THESE VALUES
const VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN || 'ebay_verification_token_2026_n8n_prod';
const ENDPOINT_URL = process.env.ENDPOINT_URL || 'https://ebay-veri.vercel.app/api/webhook-ebay';

/**
 * Vercel Serverless Function for eBay Marketplace Account Deletion Webhook
 * Handles both GET (challenge) and POST (notification) requests
 */
module.exports = async (req, res) => {
    // Set CORS headers if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ebay-signature');
    
    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Handle GET request - Challenge Code Validation
    if (req.method === 'GET') {
        return handleChallengeValidation(req, res);
    }
    
    // Handle POST request - Account Deletion Notification
    if (req.method === 'POST') {
        return handleAccountDeletionNotification(req, res);
    }
    
    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
};

/**
 * Handles eBay's challenge code validation (GET request)
 * Called when you first save your endpoint in eBay Developer Portal
 */
function handleChallengeValidation(req, res) {
    const challengeCode = req.query.challenge_code;
    
    if (!challengeCode) {
        console.error('Missing challenge_code parameter');
        return res.status(400).json({ error: 'Missing challenge_code parameter' });
    }
    
    console.log('Received challenge code:', challengeCode);
    console.log('Using verification token:', VERIFICATION_TOKEN);
    console.log('Using endpoint URL:', ENDPOINT_URL);
    
    try {
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
        return res.status(200).json({
            challengeResponse: challengeResponse
        });
    } catch (error) {
        console.error('Error processing challenge:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Handles actual marketplace account deletion notifications (POST request)
 */
async function handleAccountDeletionNotification(req, res) {
    console.log('\n=== Received eBay Account Deletion Notification ===');
    console.log('Timestamp:', new Date().toISOString());
    
    try {
        // Immediately acknowledge receipt (required by eBay)
        // Do this before processing to ensure eBay gets quick response
        res.status(200).json({ received: true });
        
        const notification = req.body;
        const signature = req.headers['x-ebay-signature'];
        
        console.log('Notification ID:', notification?.notification?.notificationId);
        console.log('Topic:', notification?.metadata?.topic);
        console.log('Event Date:', notification?.notification?.eventDate);
        console.log('Publish Attempt:', notification?.notification?.publishAttemptCount);
        
        // Extract user data
        const userData = notification?.notification?.data;
        if (userData) {
            console.log('User Data:');
            console.log('  - Username:', userData.username);
            console.log('  - User ID:', userData.userId);
            console.log('  - EIAS Token:', userData.eiasToken);
            
            // Process user data deletion
            await deleteUserData(userData);
            
            // Optional: Verify the signature (recommended for production)
            if (signature) {
                console.log('Signature present:', signature.substring(0, 20) + '...');
                // TODO: Implement signature verification
                // See: https://github.com/eBay/event-notification-nodejs-sdk
            }
        } else {
            console.log('No user data found in notification');
        }
        
        console.log('=== Notification processing completed ===\n');
        
    } catch (error) {
        console.error('Error processing notification:', error);
        // Still return 200 since we already acknowledged
    }
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
    
    try {
        // Example: Database deletion
        // await deleteFromDatabase(userData.userId);
        
        // Example: Clear from cache
        // await clearCache(userData.userId);
        
        // Example: Remove from third-party services
        // await removeFromThirdPartyServices(userData.userId);
        
        console.log('✅ User data deletion completed for:', userData.userId);
    } catch (error) {
        console.error('❌ Error deleting user data:', error);
        // Consider implementing retry logic or dead letter queue
    }
}

/**
 * Example: Delete user from database
 */
async function deleteFromDatabase(userId) {
    // TODO: Implement your database deletion
    // Example with MongoDB:
    // const { MongoClient } = require('mongodb');
    // const client = new MongoClient(process.env.MONGODB_URI);
    // await client.connect();
    // await client.db().collection('users').deleteMany({ ebayUserId: userId });
    // await client.db().collection('orders').deleteMany({ ebayUserId: userId });
    // await client.close();
    
    console.log(`  - Database records deleted for user: ${userId}`);
}

/**
 * Example: Clear user from cache
 */
async function clearCache(userId) {
    // TODO: Implement your cache clearing
    // Example with Redis:
    // const redis = require('redis');
    // const client = redis.createClient({ url: process.env.REDIS_URL });
    // await client.connect();
    // await client.del(`user:${userId}`);
    // await client.disconnect();
    
    console.log(`  - Cache cleared for user: ${userId}`);
}

/**
 * Example: Remove from third-party services
 */
async function removeFromThirdPartyServices(userId) {
    // TODO: Implement removal from third-party services
    // Example:
    // await fetch('https://analytics-service.com/api/delete-user', {
    //     method: 'POST',
    //     headers: { 'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}` },
    //     body: JSON.stringify({ userId })
    // });
    
    console.log(`  - Third-party data removed for user: ${userId}`);
}
