# Deployment Guide for nukk.nl

This guide walks you through deploying the nukk.nl fact-checking platform to production.

## Prerequisites
- GitHub repository created and code pushed
- Accounts on: Supabase, Vercel, OpenAI, Anthropic, and xAI (Grok)
- API keys for OpenAI, Anthropic, and Grok (optional)

## 1. Supabase Database Setup

### Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - Name: `nukk-nl` (or your preference)
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users (e.g., Frankfurt for EU)
   - Pricing Plan: Free tier is fine to start

### Initialize Database Schema
1. Wait for project to finish setting up (~2 minutes)
2. Go to "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the entire contents of `database/schema.sql`
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Get Connection Details
1. Go to "Settings" → "API" in the left sidebar
2. Copy these values for later:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

## 2. Vercel Deployment

### Import GitHub Repository
1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `nukk-nl` repository
5. Select the repository and click "Import"

### Configure Build Settings
Vercel should auto-detect Next.js. Verify these settings:
- Framework Preset: Next.js
- Root Directory: `./` (leave as is)
- Build Command: `next build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### Add Environment Variables
Before deploying, add all environment variables:

1. In the "Environment Variables" section, add:

```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
XAI_API_KEY=your_grok_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

2. Replace the values with your actual keys
3. For `NEXT_PUBLIC_APP_URL`, use your Vercel URL (you'll update this after first deploy)

### Deploy
1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, you'll get a URL like `https://nukk-nl-xxxxx.vercel.app`

### Update Environment Variables
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
4. Go to "Deployments" and click "Redeploy" on the latest deployment

## 3. Domain Configuration (Optional)

### Add Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your domain: `nukk.nl`
3. Follow Vercel's instructions to update your DNS records
4. SSL certificates are automatic

### Update Environment Variables
After domain is confirmed:
1. Update `NEXT_PUBLIC_APP_URL` to `https://nukk.nl`
2. Redeploy the project

## 4. Testing Production Deployment

### Basic Functionality Test
1. Visit your production URL
2. Enter a nu.nl article URL
3. Click "Analyseer artikel"
4. Verify:
   - Content extraction works
   - AI analysis completes
   - Results display correctly
   - Data saves to Supabase

### Check Database
1. In Supabase, go to "Table Editor"
2. Check that tables have data:
   - `articles` - Should have the analyzed article
   - `analyses` - Should have the analysis results
   - `annotations` - Should have AI annotations

### Monitor Logs
1. In Vercel, go to "Functions" tab
2. Check logs for any errors
3. Monitor response times

## 5. Production Checklist

- [ ] All environment variables set correctly
- [ ] Database schema created and working
- [ ] API routes responding correctly
- [ ] No TypeScript errors in build
- [ ] SSL certificate active
- [ ] Content extraction working
- [ ] AI analysis functioning
- [ ] Error handling working
- [ ] Loading states display properly
- [ ] Mobile responsive design works

## 6. Monitoring & Maintenance

### Set Up Monitoring
1. Vercel Analytics (automatic with Pro plan)
2. Supabase Dashboard for database metrics
3. OpenAI/Anthropic usage dashboards for API costs

### Regular Maintenance
- Monitor API usage and costs
- Check Supabase database size (free tier: 500MB)
- Review error logs weekly
- Update dependencies monthly

## Troubleshooting

### Build Fails
- Check all environment variables are set
- Verify no TypeScript errors: `npm run typecheck`
- Check build logs in Vercel

### Database Connection Issues
- Verify Supabase project is active
- Check environment variables match Supabase dashboard
- Ensure database schema was created successfully

### AI Analysis Fails
- Verify API keys are valid and have credits
- Check rate limits on OpenAI/Anthropic
- Monitor error logs for specific failures

### Content Extraction Issues
- Puppeteer requires specific build configuration
- May need to adjust Vercel function size (default should work)
- Check if nu.nl has changed their HTML structure

## Support

For issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console for client-side errors
4. Review server logs in Vercel Functions tab

## Cost Estimates

Free tiers should handle initial traffic:
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 2GB bandwidth
- OpenAI/Anthropic: Pay per use (~$0.01-0.03 per analysis)

For production scale, expect:
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- AI APIs: Variable based on usage