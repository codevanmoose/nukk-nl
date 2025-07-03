# CLAUDE.md - nukk.nl Development Guide

## Project Overview
Building nukk.nl - an AI-powered fact-checking platform for nu.nl articles that detects subjectivity, opinions presented as facts, and incomplete framing.

## 🚀 Current Status: PRODUCTION READY ✅
Full-featured AI fact-checking platform deployed and operational at https://nukk.nl!

## 📋 Recent Changes (Jan 2025)
- **Simplified scraping architecture**: Removed custom Puppeteer, ScrapingBee, and Browserless
- **ScrapFly-only implementation**: Now using ScrapFly as the sole scraping service
- **Enhanced reliability**: No more 403 errors or complex fallback chains
- **API key configured**: ScrapFly API key active in production

## Development Commands
```bash
# Install dependencies
npm install

# Run development server (default port 3000)
npm run dev

# Run development server on specific port
npm run dev -- -p 4000

# Run development server with hostname binding
npx next dev --port 3000 --hostname 0.0.0.0

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build for production
npm run build
```

## Tech Stack
- **Frontend**: Next.js 15.3.3, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Node.js 20+
- **AI**: OpenAI GPT-4, Anthropic Claude 3, xAI Grok (multi-model analysis)
- **Database**: PostgreSQL (Supabase)
- **Web Scraping**: ScrapFly service (1,000 free requests/month)
- **Infrastructure**: Vercel (production), ScrapFly (free tier)

## ✅ COMPLETED PRODUCTION FEATURES

### Phase 1: MVP Foundation ✅
- ✅ Next.js 15.3.3 project with TypeScript
- ✅ Tailwind CSS and Shadcn/ui setup
- ✅ ESLint and development tooling
- ✅ Environment variables configuration
- ✅ PostgreSQL database schema (Supabase)

### Phase 2: Core Functionality ✅
- ✅ Homepage with URL input validation
- ✅ Professional web scraping with ScrapFly
- ✅ AI analysis engine (OpenAI + Anthropic + Grok)
- ✅ Multi-model AI comparison feature
- ✅ URL redirect system (nukk.nl/path → analysis)
- ✅ Analysis results page with interactive UI
- ✅ Database storage and caching

### Phase 3: UI/UX ✅
- ✅ Responsive homepage design
- ✅ Hero section with URL input
- ✅ "How it works" section
- ✅ Trust indicators
- ✅ Analysis page with objectivity scoring
- ✅ Visual progress bars and breakdowns
- ✅ Loading states and error handling
- ✅ Text highlighting with color-coded annotations
- ✅ Multi-model comparison tabs

### Phase 4: Production Deployment ✅
- ✅ ScrapFly integration (1,000 free requests/month)
- ✅ All demo content removed
- ✅ Real API keys configured in production
- ✅ Production-ready error handling
- ✅ Deployed to https://nukk.nl

## 🔧 PRODUCTION STATUS
- **Production URL**: ✅ https://nukk.nl (LIVE)
- **GitHub Repository**: ✅ https://github.com/codevanmoose/nukk-nl
- **Vercel Deployment**: ✅ Auto-deployment active
- **Database**: ✅ Supabase PostgreSQL operational
- **API Keys**: ✅ OpenAI, Anthropic, xAI configured
- **Web Scraping**: ✅ ScrapFly service operational
- **Build Status**: ✅ All errors resolved

## 🏗️ Implementation Details

### Web Scraping via ScrapFly
```typescript
// Located in: src/lib/scraping-service.ts
- Professional scraping service with 1,000 free requests/month
- Dutch geolocation (NL) support
- JavaScript rendering for dynamic content
- Anti-scraping protection bypass (asp=true)
- Automatic retries with residential proxies
- Reliable extraction without maintenance overhead
```

### AI Analysis Engine
```typescript
// Located in: src/lib/ai-analyzer.ts
- Multi-model support (OpenAI GPT-4, Anthropic Claude 3, xAI Grok)
- Real-time objectivity scoring (0-100)
- Text annotation with confidence scores
- Fallback system for reliability
- Production error handling
```

### API Endpoints
```
POST /api/analyze
- Input: { url: "https://www.nu.nl/..." }
- Output: { article, analysis, annotations }
- Features: Real scraping, AI analysis, caching

POST /api/analyze-multi
- Input: { url: "...", models: ["openai", "anthropic", "grok"] }
- Output: { article, analyses: [...] }
- Features: Multi-model comparison, consensus analysis
```

### Database Schema (Supabase)
```sql
-- Located in: database/schema.sql
-- Tables: articles, analyses, annotations, user_feedback
-- Features: UUID primary keys, RLS policies, indexes
-- Status: ✅ Deployed and operational
```

### File Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/analyze/       # Single AI analysis
│   ├── api/analyze-multi/ # Multi-model analysis
│   ├── analyse/           # Analysis results page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── analysis-highlights.tsx     # Color-coded text annotations
│   ├── multi-model-analysis.tsx    # AI model comparison
│   ├── homepage/                   # Homepage sections
│   └── ui/                        # Shadcn/ui components
├── lib/                   # Core functionality
│   ├── scraping-service.ts        # ScrapFly integration
│   ├── ai-analyzer.ts             # Multi-model AI engine
│   ├── content-extractor.ts       # Content export module
│   └── supabase.ts                # Database client
├── types/                 # TypeScript definitions
├── utils/                 # Helper functions
└── middleware.ts          # URL redirect handling
```

## 🎯 PRODUCTION FEATURES

### ✅ Web Scraping (ScrapFly)
- **ScrapFly service** - Professional scraping with 1,000 free requests/month
- **Dutch optimization** - NL geolocation support
- **Anti-scraping bypass** - Built-in protection bypass (asp=true)
- **JavaScript rendering** - Handles dynamic content
- **Residential proxies** - Reliable access to nu.nl
- **Automatic retries** - Built-in retry mechanism
- **Smart extraction** - HTML parsing with fallback selectors

### ✅ AI Analysis (Multi-Model)
- **OpenAI GPT-4** - Primary analysis engine
- **Anthropic Claude 3** - Secondary analysis for comparison
- **xAI Grok** - Third opinion for consensus
- **Real-time scoring** - Objectivity percentage (0-100)
- **Text annotations** - Color-coded highlighting

### ✅ User Experience
- **Instant analysis** - Enter nu.nl URL, get results
- **Visual breakdown** - Progress bars, color coding
- **Multi-model comparison** - See how different AIs analyze
- **Mobile responsive** - Works on all devices
- **Fast loading** - Optimized for speed

## Key Production Considerations
- ✅ Real API keys configured (no demo content)
- ✅ Professional scraping with ScrapFly (1,000 free requests/month)
- ✅ Multi-model AI provides reliability through consensus
- ✅ Proper error handling for production environment
- ✅ Mobile-responsive design
- ✅ Fast page load times (<2 seconds)
- ✅ GDPR-compliant data handling
- ✅ Cost optimization (free tier covers typical usage)

## Testing Checklist ✅
- ✅ All API endpoints return real data
- ✅ URL redirect works for all nu.nl formats
- ✅ AI analysis completes in <5 seconds
- ✅ Multi-model comparison functional
- ✅ Mobile layout is responsive
- ✅ Error states are handled gracefully
- ✅ ScrapFly reliably scrapes nu.nl articles

## 🚀 READY FOR USE
**Visit https://nukk.nl and paste any nu.nl article URL to experience AI-powered fact-checking!**

Features available:
- Real-time article scraping and analysis
- Objectivity scoring with detailed breakdown
- Color-coded text highlighting
- Multi-model AI comparison
- Mobile-responsive interface

## API Keys Setup (For Local Development)
See `setup-api-keys.md` for local environment configuration.
Production API keys are already configured in Vercel.

## 📋 Next Steps
See `TODO.md` for upcoming tasks and future enhancements.

## Production Infrastructure
- **Production URL**: https://nukk.nl
- **GitHub**: https://github.com/codevanmoose/nukk-nl  
- **Vercel**: Auto-deployment from main branch
- **Database**: Supabase PostgreSQL
- **CDN**: Vercel Edge Network