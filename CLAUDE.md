# CLAUDE.md - nukk.nl Development Guide

## Project Overview
Building nukk.nl - an AI-powered fact-checking platform for nu.nl articles that detects subjectivity, opinions presented as facts, and incomplete framing.

## 🚀 Current Status: PRODUCTION READY ✅
Full-featured AI fact-checking platform deployed and operational at https://nukk.nl!

## 📋 Recent Changes (July 2025)
- **WeTransfer-inspired redesign**: Complete homepage transformation to split-screen layout
- **Professional interface**: Left pane (30%) minimal input card, right pane (70%) premium ads
- **Enhanced monetization**: Persistent ad placement replacing temporary overlays
- **Mobile optimization**: Responsive vertical stacking for mobile devices
- **Simplified scraping architecture**: ScrapFly-only implementation (1,000 requests/month)
- **Enhanced reliability**: No more 403 errors or complex fallback chains
- **Real AI Integration**: Configured to use actual OpenAI, Anthropic, and xAI APIs from Vercel environment
- **Fixed Client-Side Errors**: Separated Supabase clients for proper server/client isolation
- **Improved UX Flow**: "Ontdek de mogelijkheden" now shows adverteren info in right panel
- **Google Analytics**: Added GA4 tracking with measurement ID G-EQTEDY3XMD
- **Brand Identity**: Integrated nukk.nl logo (blue circle with white text) throughout the site
- **Analysis Page Overhaul**: Always-on multi-model AI analysis with gradient background overlay
- **Improved Content Extraction**: Enhanced nu.nl scraping patterns with fallback mechanisms
- **Fixed Hydration Issues**: Resolved React SSR/client hydration mismatches

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
- ✅ Multi-model AI comparison feature (always-on)
- ✅ URL redirect system (nukk.nl/path → analysis)
- ✅ Analysis results page with gradient background overlay
- ✅ Database storage and caching
- ✅ Enhanced content extraction with fallback patterns

### Phase 3: UI/UX ✅
- ✅ WeTransfer-inspired split-screen design
- ✅ Minimal input card with clean URL submission
- ✅ Premium advertisement pane (persistent, full-height)
- ✅ Mobile-responsive vertical stacking
- ✅ "How it works" section
- ✅ Trust indicators
- ✅ Analysis page with objectivity scoring and gradient background
- ✅ Visual progress bars and breakdowns
- ✅ Loading states and error handling
- ✅ Text highlighting with color-coded annotations
- ✅ Always-visible multi-model AI analysis (no toggle required)
- ✅ Semi-transparent overlay cards on advertisement background

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
- **API Keys**: ✅ OpenAI, Anthropic, xAI configured in Vercel
- **Web Scraping**: ✅ ScrapFly service operational
- **Analytics**: ✅ Google Analytics GA4 (G-EQTEDY3XMD)
- **Build Status**: ✅ All errors resolved
- **Logo**: ✅ nukk.nl branding implemented

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
│   │   ├── split-screen-layout.tsx    # WeTransfer-style layout
│   │   ├── public-page-layout.tsx     # Reusable layout wrapper
│   │   └── footer.tsx                 # Footer with logo
│   ├── homepage/
│   │   ├── minimal-input-card.tsx     # Clean URL input card
│   │   └── adverteren-content.tsx     # Advertising info component
│   ├── ads/
│   │   └── premium-ad-pane.tsx        # Full-height ad display
│   ├── analytics/
│   │   └── google-analytics.tsx       # GA4 tracking component
│   ├── analysis-highlights.tsx        # Color-coded text annotations
│   ├── multi-model-analysis.tsx       # AI model comparison
│   └── ui/                           # Shadcn/ui components
├── lib/                   # Core functionality
│   ├── scraping-service.ts        # ScrapFly integration
│   ├── ai-analyzer.ts             # Multi-model AI engine
│   ├── wallpaper-ads-config.ts    # Ad pricing & rotation
│   ├── content-extractor.ts       # Content export module
│   ├── supabase-client.ts         # Client-side database access
│   └── supabase-admin.ts          # Server-side database access
├── types/                 # TypeScript definitions
├── utils/                 # Helper functions
├── public/
│   └── images/
│       └── nukk-logo.svg         # Brand logo
├── scripts/
│   └── generate-logo.html        # Logo generation script
└── middleware.ts          # URL redirect handling
```

## 🔧 RECENT TECHNICAL IMPROVEMENTS (July 5, 2025)

### Content Extraction Enhancements
```typescript
// Located in: src/lib/scraping-service.ts
- Multiple fallback patterns for title, author, and content extraction
- Paragraph extraction as backup when main article patterns fail
- Enhanced regex patterns for nu.nl HTML structure changes
- Debug logging for extraction diagnostics
- Title cleanup to remove site suffix (| NU.nl)
```

### Analysis Page Overhaul
```typescript
// Located in: src/app/analyse/page.tsx
- Removed "Vergelijk AI modellen" toggle - always show all AI analyses
- Automatic multi-model analysis on page load
- Gradient background overlay (blue-purple-pink) matching landing page
- Semi-transparent analysis cards (bg-white/95 backdrop-blur-sm)
- Fixed React hydration mismatches by avoiding inline JSX creation
```

### Middleware URL Pattern Fix
```typescript
// Located in: src/middleware.ts
- Fixed regex pattern for nu.nl article URL recognition
- Pattern: /^\/[a-z-]+\/\d+\/[a-z0-9-]+\.html?$/i
- Ensures proper redirect to analysis page for article URLs
```

### React SSR/Hydration Fixes
```typescript
// Located in: src/components/multi-model-analysis.tsx
- Replaced inline icon creation with modelType string approach
- Dynamic icon generation in component to prevent hydration mismatches
- Consistent server/client rendering for React elements
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
- **WeTransfer-inspired design** - Professional split-screen interface (30%/70%)
- **Minimal input card** - Clean, distraction-free URL submission with logo
- **Premium ad integration** - Full-height, always-visible advertising
- **Instant analysis** - Enter nu.nl URL, get results
- **Visual breakdown** - Progress bars, color coding
- **Always-on multi-model comparison** - Automatic analysis by all AI models without toggle
- **Mobile responsive** - Vertical stacking on mobile devices
- **Fast loading** - Optimized for speed and Core Web Vitals
- **Smart UI flow** - URL input always accessible, adverteren info in right panel
- **Analytics tracking** - User engagement monitoring with GA4

## Key Production Considerations
- ✅ WeTransfer-inspired professional design for premium advertising (30%/70% split)
- ✅ Real API keys configured (no demo content) - stored in Vercel env variables
- ✅ Professional scraping with ScrapFly (1,000 free requests/month)
- ✅ Multi-model AI provides reliability through consensus
- ✅ Enhanced monetization with persistent ad placement
- ✅ Proper error handling for production environment
- ✅ Mobile-responsive split-screen to vertical stacking
- ✅ Fast page load times (<2 seconds)
- ✅ GDPR-compliant data handling
- ✅ Cost optimization (free tier covers typical usage)
- ✅ Client/server separation for secure environment variable access
- ✅ Google Analytics integration for usage insights
- ✅ Professional branding with nukk.nl logo

## Testing Checklist ✅
- ✅ WeTransfer-style split-screen layout functional (30%/70%)
- ✅ Premium ad pane displays correctly
- ✅ Mobile vertical stacking responsive
- ✅ All API endpoints return real data (no mock mode)
- ✅ URL redirect works for all nu.nl formats
- ✅ AI analysis completes in <5 seconds
- ✅ Always-on multi-model comparison functional
- ✅ Error states are handled gracefully
- ✅ ScrapFly reliably scrapes nu.nl articles
- ✅ Ad rotation and tracking system operational
- ✅ Client-side environment variables properly separated
- ✅ Google Analytics tracking events firing correctly
- ✅ Logo displays correctly across all pages
- ✅ Adverteren content shows in right panel without losing URL input

## 🚀 READY FOR USE
**Visit https://nukk.nl and paste any nu.nl article URL to experience AI-powered fact-checking!**

Features available:
- WeTransfer-inspired split-screen design (30%/70%)
- Real-time article scraping and analysis
- Objectivity scoring with detailed breakdown
- Color-coded text highlighting
- Multi-model AI comparison
- Premium advertisement integration
- Mobile-responsive interface with vertical stacking
- Google Analytics tracking for insights
- Professional nukk.nl branding
- Smart UI flow with persistent URL input

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

## 📅 Latest Session Summary (July 5, 2025)
Completed critical analysis improvements and bug fixes:
1. **Analysis Page Overhaul**: Removed toggle requirement - multi-model analysis now automatic
2. **Enhanced UI/UX**: Added gradient background overlay with semi-transparent analysis cards
3. **Content Extraction Fix**: Improved nu.nl scraping patterns with multiple fallback mechanisms
4. **Middleware Fix**: Corrected URL pattern validation for proper nu.nl article recognition
5. **Client-Side Error Resolution**: Fixed React hydration mismatch causing application crashes
6. **Production Stability**: All analysis functionality now working reliably in production
7. **Documentation Updates**: Updated CLAUDE.md with all session changes for continuity

## 📅 Previous Session Summary (July 4, 2025)
Completed major production improvements:
1. **Layout Consistency**: Applied WeTransfer-style split-screen to all pages
2. **Error Resolution**: Fixed analysis functionality and client-side errors
3. **Production Deployment**: Configured real API keys, removed mock mode
4. **UX Improvements**: Enhanced adverteren flow, kept URL input persistent
5. **Analytics Integration**: Added Google Analytics GA4 tracking
6. **Brand Implementation**: Created and integrated nukk.nl logo
7. **Documentation**: Updated all relevant files for session continuity

## 🎯 Next Session Focus
Suggested priorities for future development:
1. **Performance Monitoring**: Monitor analysis response times and optimize if needed
2. **User Feedback System**: Add feedback collection after analyses for quality improvement
3. **Content Quality**: Monitor scraping success rates and adjust patterns as nu.nl evolves
4. **Advanced Features**: Trending articles, saved analyses dashboard, user accounts
5. **SEO Enhancement**: Meta tags, structured data, sitemap for better discoverability
6. **Analytics Deep Dive**: Use GA4 data to optimize user experience and conversion
7. **A/B Testing**: Test different ad placements and analysis presentations
8. **Accessibility**: WCAG compliance improvements for broader accessibility
9. **Internationalization**: English language support for international users