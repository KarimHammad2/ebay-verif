# 🚀 Deploying eBay Webhook to Vercel

This guide will help you deploy your eBay Marketplace Account Deletion webhook handler to Vercel.

## 📋 Prerequisites

1. [Vercel account](https://vercel.com/signup) (free tier works!)
2. Git repository (GitHub, GitLab, or Bitbucket)
3. [Vercel CLI](https://vercel.com/cli) (optional but recommended)

## 🎯 Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - eBay webhook handler"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ebay-webhook.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Set Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables:
   
   | Variable | Value | Example |
   |----------|-------|---------|
   | `VERIFICATION_TOKEN` | Your eBay verification token | `ebay_verification_token_2026_n8n_prod` |
   | `ENDPOINT_URL` | Your Vercel URL + `/api/webhook-ebay` | `https://your-project.vercel.app/api/webhook-ebay` |

4. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete (usually < 1 minute)
   - Copy your deployment URL

### Option 2: Deploy via Vercel CLI (Faster for Updates)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (Select your account)
   - Link to existing project? `N`
   - What's your project's name? `ebay-webhook`
   - In which directory is your code located? `./`
   
4. **Add Environment Variables**
   ```bash
   vercel env add VERIFICATION_TOKEN
   # Paste your token when prompted
   
   vercel env add ENDPOINT_URL
   # Paste your Vercel URL + /api/webhook-ebay
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 🔧 After Deployment

### 1. Get Your Endpoint URL

Your webhook URL will be:
```
https://YOUR-PROJECT.vercel.app/api/webhook-ebay
```

Example:
```
https://ebay-webhook-abc123.vercel.app/api/webhook-ebay
```

### 2. Update Environment Variable

**Important:** Update the `ENDPOINT_URL` environment variable with your actual Vercel URL:

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Edit `ENDPOINT_URL`
4. Set to: `https://YOUR-PROJECT.vercel.app/api/webhook-ebay`
5. Redeploy: Deployments → ⋯ → Redeploy

Or via CLI:
```bash
vercel env rm ENDPOINT_URL production
vercel env add ENDPOINT_URL production
# Enter: https://YOUR-PROJECT.vercel.app/api/webhook-ebay
vercel --prod
```

### 3. Test Your Endpoint

```bash
# Test challenge validation
curl "https://YOUR-PROJECT.vercel.app/api/webhook-ebay?challenge_code=test123"

# Should return:
# {"challengeResponse":"some_hex_hash_value"}
```

### 4. Configure eBay Developer Portal

1. Go to [eBay Developer Portal](https://developer.ebay.com/)
2. Navigate to: **Alerts & Notifications** → **Marketplace Account Deletion**
3. Enter:
   - **Email**: Your notification email
   - **Endpoint URL**: `https://YOUR-PROJECT.vercel.app/api/webhook-ebay`
   - **Verification Token**: Same as your `VERIFICATION_TOKEN` env var
4. Click **"Save"**
5. eBay will send a challenge code to validate your endpoint

## 📊 Monitoring

### View Logs in Vercel

1. Go to your project in Vercel Dashboard
2. Click on a deployment
3. Click **"Functions"** tab
4. Click on `api/webhook-ebay.js`
5. View logs in real-time

Or via CLI:
```bash
vercel logs YOUR-PROJECT.vercel.app
```

### Test with eBay's "Send Test Notification"

1. In eBay Developer Portal → Alerts & Notifications
2. Click **"Send Test Notification"**
3. Check Vercel logs to see the notification

## 🔄 Making Updates

After making code changes:

```bash
# Stage and commit changes
git add .
git commit -m "Update webhook logic"

# Push to GitHub (if using Dashboard deploy)
git push

# OR deploy directly with CLI
vercel --prod
```

Vercel will automatically redeploy if connected to Git!

## 🌍 Custom Domain (Optional)

Want to use your own domain?

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed
4. Update `ENDPOINT_URL` environment variable
5. Update eBay Developer Portal with new domain

## ⚡ Vercel Limits (Free Tier)

- ✅ **Serverless Function Execution**: 100 GB-Hours/month
- ✅ **Bandwidth**: 100 GB/month
- ✅ **Invocations**: 1,000,000/month
- ⏱️ **Max Duration**: 10 seconds per request

**For eBay webhooks**: Free tier is more than sufficient! eBay expects:
- Most days: 0 notifications
- Occasional bursts: Up to 1,500 notifications/day

## 🐛 Troubleshooting

### "Validation Failed" in eBay Portal

**Check:**
1. `ENDPOINT_URL` in Vercel matches exactly what you entered in eBay Portal
2. `VERIFICATION_TOKEN` in Vercel matches exactly what you entered in eBay Portal
3. Your endpoint is accessible: `curl https://your-url/api/webhook-ebay?challenge_code=test`
4. Check Vercel function logs for errors

### "Cannot find module 'crypto'"

The `crypto` module is built into Node.js. If you see this error:
- Ensure `vercel.json` specifies `@vercel/node` runtime
- This should work by default on Vercel

### Environment Variables Not Working

After adding/updating environment variables:
1. You must **redeploy** for changes to take effect
2. Go to Deployments → Select latest → ⋯ → Redeploy
3. Or: `vercel --prod` via CLI

### "Function invocation timeout"

If processing takes too long:
1. Acknowledge webhook immediately (we do this with `res.status(200)`)
2. Process data deletion asynchronously
3. Consider using a queue system for heavy processing

## 📚 Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [eBay Marketplace Account Deletion Docs](https://developer.ebay.com/develop/guides-v2/marketplace-user-account-deletion/marketplace-user-account-deletion)

## 🎉 Success!

Once deployed and validated:
- ✅ Your endpoint is live 24/7
- ✅ eBay will send notifications when users request deletion
- ✅ You're compliant with eBay Developer Program requirements
- ✅ Your webhook auto-scales with Vercel's infrastructure

---

**Need help?** Check Vercel logs or test with:
```bash
curl "https://YOUR-PROJECT.vercel.app/api/webhook-ebay?challenge_code=test123"
```
