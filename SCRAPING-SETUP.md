# Scraping Service Setup for nukk.nl

To properly extract content from nu.nl articles, you need to set up one of the following scraping services:

## Option 1: ScrapingBee (Recommended)

1. Sign up at https://www.scrapingbee.com
2. Get your API key from the dashboard
3. Add to Vercel:
   ```bash
   vercel env add SCRAPINGBEE_API_KEY
   ```
   
**Pricing**: 
- Free: 1,000 credits
- Freelance: $49/month for 150,000 credits
- Startup: $99/month for 500,000 credits

## Option 2: Browserless

1. Sign up at https://www.browserless.io
2. Get your API token
3. Add to Vercel:
   ```bash
   vercel env add BROWSERLESS_API_KEY
   ```

**Pricing**:
- Free: 6 hours/month
- Starter: $50/month for 50 hours
- Business: $200/month for 200 hours

## Option 3: Bright Data (Enterprise)

For high-volume production use:
- Visit https://brightdata.com
- Contact sales for custom pricing
- Includes residential proxies for better success rates

## Current Status

Without a scraping service configured, nukk.nl will use demo content to demonstrate the analysis functionality.

## Testing

Once you've added a scraping API key:

1. Deploy to Vercel: `vercel --prod`
2. Test with: https://www.nukk.nl/politiek/6361052/asielwetten-lijken-te-stranden-in-eerste-kamer-cda-stemt-tegen.html
3. The analysis should show real content from the nu.nl article

## Environment Variables Needed

```bash
# AI Services (Required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Scraping Service (Choose one)
SCRAPINGBEE_API_KEY=your-api-key
# OR
BROWSERLESS_API_KEY=your-api-key

# Payment & Email (Already configured)
STRIPE_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```