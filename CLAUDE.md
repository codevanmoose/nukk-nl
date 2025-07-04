# CLAUDE.md - nukk.nl Development Guide

## Project Overview
Building nukk.nl - an AI-powered fact-checking platform for nu.nl articles that detects subjectivity, opinions presented as facts, and incomplete framing.

## 🚀 Current Status: PRODUCTION READY ✅
Full-featured AI fact-checking platform deployed and operational at https://nukk.nl!

## 📋 Recent Changes (July 2025)
- **WeTransfer-inspired redesign**: Complete homepage transformation to split-screen layout
- **Professional interface**: Left pane (35%) minimal input card, right pane (65%) premium ads
- **Enhanced monetization**: Persistent ad placement replacing temporary overlays
- **Mobile optimization**: Responsive vertical stacking for mobile devices
- **Simplified scraping architecture**: ScrapFly-only implementation (1,000 requests/month)
- **Enhanced reliability**: No more 403 errors or complex fallback chains

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
- ✅ WeTransfer-inspired split-screen design
- ✅ Minimal input card with clean URL submission
- ✅ Premium advertisement pane (persistent, full-height)
- ✅ Mobile-responsive vertical stacking
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
│   ├── layout.tsx         # Root layout (streamlined)
│   └── page.tsx           # Homepage (split-screen)
├── components/            # React components
│   ├── layout/
│   │   └── split-screen-layout.tsx    # WeTransfer-style layout
│   ├── homepage/
│   │   └── minimal-input-card.tsx     # Clean URL input card
│   ├── ads/
│   │   └── premium-ad-pane.tsx        # Full-height ad display
│   ├── analysis-highlights.tsx        # Color-coded text annotations
│   ├── multi-model-analysis.tsx       # AI model comparison
│   └── ui/                           # Shadcn/ui components
├── lib/                   # Core functionality
│   ├── scraping-service.ts        # ScrapFly integration
│   ├── ai-analyzer.ts             # Multi-model AI engine
│   ├── wallpaper-ads-config.ts    # Ad pricing & rotation
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
- **WeTransfer-inspired design** - Professional split-screen interface
- **Minimal input card** - Clean, distraction-free URL submission
- **Premium ad integration** - Full-height, always-visible advertising
- **Instant analysis** - Enter nu.nl URL, get results
- **Visual breakdown** - Progress bars, color coding
- **Multi-model comparison** - See how different AIs analyze
- **Mobile responsive** - Vertical stacking on mobile devices
- **Fast loading** - Optimized for speed and Core Web Vitals

## Key Production Considerations
- ✅ WeTransfer-inspired professional design for premium advertising
- ✅ Real API keys configured (no demo content)
- ✅ Professional scraping with ScrapFly (1,000 free requests/month)
- ✅ Multi-model AI provides reliability through consensus
- ✅ Enhanced monetization with persistent ad placement
- ✅ Proper error handling for production environment
- ✅ Mobile-responsive split-screen to vertical stacking
- ✅ Fast page load times (<2 seconds)
- ✅ GDPR-compliant data handling
- ✅ Cost optimization (free tier covers typical usage)

## Testing Checklist ✅
- ✅ WeTransfer-style split-screen layout functional
- ✅ Premium ad pane displays correctly
- ✅ Mobile vertical stacking responsive
- ✅ All API endpoints return real data
- ✅ URL redirect works for all nu.nl formats
- ✅ AI analysis completes in <5 seconds
- ✅ Multi-model comparison functional
- ✅ Error states are handled gracefully
- ✅ ScrapFly reliably scrapes nu.nl articles
- ✅ Ad rotation and tracking system operational

## 🚀 READY FOR USE
**Visit https://nukk.nl and paste any nu.nl article URL to experience AI-powered fact-checking!**

Features available:
- WeTransfer-inspired split-screen design
- Real-time article scraping and analysis
- Objectivity scoring with detailed breakdown
- Color-coded text highlighting
- Multi-model AI comparison
- Premium advertisement integration
- Mobile-responsive interface with vertical stacking

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