# 🚀 Quick Deploy to Vercel

## Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

## Step 2: Login
```bash
vercel login
```

## Step 3: Deploy
```bash
vercel
```

## Step 4: Set Environment Variables

After deployment, you'll get a URL like: `https://ebay-webhook-xyz.vercel.app`

Add environment variables:
```bash
vercel env add VERIFICATION_TOKEN
# Enter: ebay_verification_token_2026_n8n_prod

vercel env add ENDPOINT_URL
# Enter: https://YOUR-ACTUAL-URL.vercel.app/api/webhook-ebay
```

## Step 5: Deploy to Production
```bash
vercel --prod
```

## Step 6: Test
```bash
curl "https://YOUR-URL.vercel.app/api/webhook-ebay?challenge_code=test123"
```

## Step 7: Configure eBay

Go to eBay Developer Portal:
- **Email**: Karim@celestalink.com
- **Endpoint URL**: `https://YOUR-URL.vercel.app/api/webhook-ebay`
- **Verification Token**: `ebay_verification_token_2026_n8n_prod`

✅ Click Save and validation should pass!

---

📖 For detailed instructions, see: `vercel-README.md`
