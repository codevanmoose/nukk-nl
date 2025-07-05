# Vercel Environment Variables Setup Guide

## Required Environment Variables for Production

To make the analysis functionality work on https://nukk.nl, you need to add the following environment variables in the Vercel dashboard:

### 1. Go to Vercel Dashboard
1. Log in to https://vercel.com
2. Select the `nukk-nl` project
3. Go to Settings → Environment Variables

### 2. Add AI API Keys (At least one required)

#### Option A: OpenAI (Recommended)
```
OPENAI_API_KEY=sk-...your-openai-api-key...
```
- Get your API key from: https://platform.openai.com/api-keys
- Required for GPT-4 analysis

#### Option B: Anthropic Claude
```
ANTHROPIC_API_KEY=sk-ant-...your-anthropic-api-key...
```
- Get your API key from: https://console.anthropic.com/settings/keys
- Required for Claude 3 analysis

#### Option C: xAI Grok (Optional)
```
XAI_API_KEY=xai-...your-xai-api-key...
```
- Get your API key from: https://x.ai/api
- Required for Grok analysis

### 3. Verify Existing Variables

These should already be configured:
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `SCRAPFLY_API_KEY` ✓

### 4. Important Notes

- **At least one AI API key is required** for the analysis to work
- If no API keys are configured, the system will fall back to mock analysis
- The production environment has `USE_MOCK_ANALYSIS=false`, so real APIs are expected
- After adding environment variables, redeploy the application for changes to take effect

### 5. Testing

After adding the API keys and redeploying:
1. Visit https://nukk.nl
2. Enter a nu.nl article URL
3. The analysis should now work properly

### 6. Cost Considerations

- **OpenAI**: Pay per token usage, GPT-4 is more expensive but higher quality
- **Anthropic**: Similar pricing model to OpenAI
- **xAI**: Check current pricing at x.ai
- **ScrapFly**: Free tier includes 1,000 requests/month

### 7. Fallback Behavior

The system will try APIs in this order:
1. OpenAI (if configured)
2. Anthropic (if configured)
3. xAI/Grok (if configured)
4. Mock analysis (if no APIs are available)

With the code changes made, even without API keys, the site will show mock analysis instead of erroring out.