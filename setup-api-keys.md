# API Keys Setup Guide

## 1. Local Development

Edit your `.env.local` file and replace these lines:

```bash
# AI APIs
# Remove these lines or add real keys for production
# OPENAI_API_KEY=sk-proj-your-real-key-here
# ANTHROPIC_API_KEY=sk-ant-your-real-key-here
# XAI_API_KEY=xai-your-real-key-here
```

With your real API keys:

```bash
# AI APIs
OPENAI_API_KEY=sk-proj-[YOUR_OPENAI_KEY]
ANTHROPIC_API_KEY=sk-ant-[YOUR_ANTHROPIC_KEY]
XAI_API_KEY=xai-[YOUR_XAI_KEY]

# Scraping Services (optional fallback services)
SCRAPINGBEE_API_KEY=[YOUR_SCRAPINGBEE_KEY]
BROWSERLESS_API_KEY=[YOUR_BROWSERLESS_KEY]
```

## 2. Production (Vercel)

Add these environment variables in Vercel:
1. Go to https://vercel.com/vanmooseprojects/nukk-nl
2. Settings → Environment Variables
3. Add each key:

- `OPENAI_API_KEY` = `sk-proj-[YOUR_OPENAI_KEY]`
- `ANTHROPIC_API_KEY` = `sk-ant-[YOUR_ANTHROPIC_KEY]`
- `XAI_API_KEY` = `xai-[YOUR_XAI_KEY]`
- `SCRAPINGBEE_API_KEY` = `[YOUR_SCRAPINGBEE_KEY]` (optional, for scraping fallback)
- `BROWSERLESS_API_KEY` = `[YOUR_BROWSERLESS_KEY]` (optional, for scraping fallback)

## 3. Test Locally

After adding the keys:
```bash
npm run dev
```

Visit http://localhost:3000 and test with a nu.nl article.

## 4. Deploy

After Vercel environment variables are set:
```bash
vercel --prod
```

The AI analysis should now work on production!