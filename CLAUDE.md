# CLAUDE.md - nukk.nl Development Guide

## Project Overview
Building nukk.nl - an AI-powered fact-checking platform for nu.nl articles that detects subjectivity, opinions presented as facts, and incomplete framing.

## 🎉 Current Status: MVP COMPLETED ✅
The core functionality is complete and running on localhost:3000!

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
- **AI**: OpenAI GPT-4, Anthropic Claude 3, xAI Grok (triple fallback)
- **Database**: PostgreSQL (Supabase)
- **Web Scraping**: Puppeteer
- **Infrastructure**: Vercel (frontend), Google Cloud Run (backend), Cloudflare (CDN/WAF)

## ✅ Completed Core Features

### Phase 1: MVP Foundation ✅
- ✅ Next.js 15.3.3 project with TypeScript
- ✅ Tailwind CSS and Shadcn/ui setup
- ✅ ESLint and development tooling
- ✅ Environment variables configuration
- ✅ PostgreSQL database schema (Supabase)

### Phase 2: Core Functionality ✅
- ✅ Homepage with URL input validation
- ✅ nu.nl content extraction with Puppeteer
- ✅ AI analysis engine (OpenAI + Anthropic + Grok triple fallback)
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

## 🔧 Current Server Status
- **Development Server**: Running on http://localhost:3000
- **Status**: Ready and accessible
- **Build Status**: All TypeScript and ESLint errors fixed
- **Middleware**: Temporarily disabled for debugging

## 📋 Next Steps & Roadmap

### 🔥 High Priority (Ready for Production)
- [ ] **Set up environment variables for production**
  - Add OpenAI API key
  - Add Anthropic API key
  - Add Grok (xAI) API key (optional but recommended)
  - Configure Supabase credentials
  - Set up Redis (optional)

- [ ] **Test end-to-end functionality with real nu.nl URLs**
  - Test content extraction
  - Verify AI analysis accuracy
  - Check database storage
  - Validate UI response

- [ ] **Re-enable and fix URL redirect middleware**
  - Test nukk.nl/path → analysis redirects
  - Handle edge cases and errors
  - Improve performance

### 🎯 Medium Priority (Enhanced Features)
- [ ] **Enhanced annotation display with text highlighting**
  - Show AI annotations inline in article text
  - Color-coded highlighting by category
  - Hover tooltips with explanations

- [ ] **User feedback collection system**
  - Add thumbs up/down on analyses
  - Collect accuracy feedback
  - Implement feedback form

- [ ] **Performance optimizations**
  - Implement Redis caching
  - Add request rate limiting
  - Optimize Puppeteer scraping

### 🚀 Low Priority (Future Enhancements)
- [ ] **Blog system for automatic content generation**
  - Auto-generate blog posts from analyses
  - SEO optimization
  - RSS feeds

- [ ] **Social media integration (Twitter/X)**
  - Auto-post interesting analyses
  - Social sharing buttons
  - Viral mechanics

- [ ] **Prepare for production deployment**
  - Vercel deployment setup
  - Domain configuration
  - SSL and security headers

## 🏗️ Implementation Details

### Database Schema (Supabase)
```sql
-- Located in: database/schema.sql
-- Tables: articles, analyses, annotations, user_feedback
-- Features: UUID primary keys, RLS policies, indexes
```

### API Endpoints
```
POST /api/analyze
- Input: { url: "https://www.nu.nl/..." }
- Output: { article, analysis, annotations }
- Features: Caching, error handling, AI fallback
```

### File Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/analyze/    # Analysis API endpoint
│   ├── analyse/        # Analysis results page
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── homepage/      # Homepage sections
│   └── ui/           # Shadcn/ui components
├── lib/              # Core functionality
│   ├── ai-analyzer.ts     # AI analysis engine
│   ├── content-extractor.ts # Web scraping
│   └── supabase.ts        # Database client
├── types/            # TypeScript definitions
├── utils/           # Helper functions
└── middleware.ts    # URL redirect handling
```

## Key Considerations
- Always validate nu.nl URLs before processing
- Cache AI responses to reduce costs
- Implement proper error handling throughout
- Focus on mobile responsiveness
- Maintain 95% AI accuracy threshold
- Keep page load times under 2 seconds
- Ensure GDPR compliance

## Testing Checklist
- [ ] All API endpoints return correct data
- [ ] URL redirect works for all nu.nl formats
- [ ] AI analysis completes in <5 seconds
- [ ] Advertisements display correctly
- [ ] Mobile layout is responsive
- [ ] Accessibility standards are met
- [ ] Share functionality works on all platforms
- [ ] Error states are handled gracefully

## Authenticated Services on This Machine
The following services are authenticated and available for all projects:
- **GitHub**: SSH key authentication configured
- **Vercel**: Logged in as `vanmoose`
- **Supabase**: API token configured
- **DigitalOcean**: Authenticated with `jaspervanmoose@gmail.com`

All CLIs are installed and authentication persists across restarts.