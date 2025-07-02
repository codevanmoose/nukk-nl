# Manual Environment Variable Fix for Vercel

## Current Issue
The `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` are only set for Production environment, but they need to be available for Development and Preview environments as well.

## Step-by-Step Fix

### 1. Remove the existing Production-only keys:
```bash
vercel env rm OPENAI_API_KEY production --yes
vercel env rm ANTHROPIC_API_KEY production --yes
```

### 2. Add the keys to ALL environments:

For OpenAI:
```bash
# This will prompt you to enter the key
vercel env add OPENAI_API_KEY --sensitive
```

For Anthropic:
```bash
# This will prompt you to enter the key
vercel env add ANTHROPIC_API_KEY --sensitive
```

### 3. Verify the changes:
```bash
vercel env ls
```

You should see both keys listed with "Development, Preview, Production" in the environments column.

### 4. Deploy the changes:
```bash
vercel --prod
```

## Alternative: Using echo for automation
If you have the keys in a secure location:

```bash
echo "your-openai-key-here" | vercel env add OPENAI_API_KEY --sensitive
echo "your-anthropic-key-here" | vercel env add ANTHROPIC_API_KEY --sensitive
```

## Where to find your API keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys

## Testing
After deployment, test the API at:
- Development: http://localhost:3000/api/analyze
- Production: https://nukk.nl/api/analyze

With a POST request:
```json
{
  "url": "https://www.nu.nl/tech/6334104/chatgpt-heeft-300-miljoen-wekelijkse-gebruikers.html"
}
```