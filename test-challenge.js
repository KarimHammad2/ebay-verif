/**
 * Test script to verify your challenge response calculation
 * This simulates what eBay does when validating your endpoint
 */

const crypto = require('crypto');

// Configuration - should match your server.js
const VERIFICATION_TOKEN = 'ebay_verification_token_2026_n8n_prod';
const ENDPOINT_URL = 'https://n8n.srv839866.hstgr.cloud/webhook/ebay';
const TEST_CHALLENGE_CODE = 'test_challenge_123456';

// Calculate the challenge response
const hash = crypto.createHash('sha256');
hash.update(TEST_CHALLENGE_CODE);
hash.update(VERIFICATION_TOKEN);
hash.update(ENDPOINT_URL);
const challengeResponse = hash.digest('hex');

console.log('=== eBay Challenge Response Test ===\n');
console.log('Configuration:');
console.log('  Verification Token:', VERIFICATION_TOKEN);
console.log('  Endpoint URL:', ENDPOINT_URL);
console.log('  Test Challenge Code:', TEST_CHALLENGE_CODE);
console.log('\nCalculated Challenge Response:');
console.log('  ' + challengeResponse);
console.log('\nThis is what your server should return when eBay sends a challenge code.');
console.log('\nTo test your live server, run:');
console.log(`  curl "http://localhost:3000/webhook/ebay?challenge_code=${TEST_CHALLENGE_CODE}"`);
