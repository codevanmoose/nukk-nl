# nukk.nl - AI-Powered Fact-Checking for nu.nl

AI-powered fact-checking platform that analyzes nu.nl articles to detect subjectivity, opinions presented as facts, and incomplete framing.

🌐 **Live at**: [https://nukk.nl](https://nukk.nl)

## Features

- 🔍 **URL Analysis**: Simply paste a nu.nl URL to get instant fact-checking
- 🧠 **Multi-AI Analysis**: Uses OpenAI GPT-4, Anthropic Claude 3, and xAI Grok for comprehensive analysis
- 📊 **Objectivity Scoring**: Get a 0-100 objectivity score with detailed breakdown
- 🎯 **Content Classification**: Identifies facts, opinions, suggestive language, and incomplete information
- 🔄 **Smart Redirects**: Support nukk.nl/path URLs that automatically redirect to analysis
- 💾 **Caching**: Stores analyses to avoid re-processing the same articles
- 🎨 **Professional UI**: WeTransfer-inspired split-screen design with gradient backgrounds
- 📱 **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: Next.js 15.3.3, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Node.js 20+
- **AI**: OpenAI GPT-4, Anthropic Claude 3, xAI Grok (multi-model analysis)
- **Database**: PostgreSQL (Supabase)
- **Web Scraping**: ScrapFly service (1,000 free requests/month)
- **Infrastructure**: Vercel (production), ScrapFly (free tier)
- **Analytics**: Google Analytics GA4

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase account)
- OpenAI API key
- Anthropic API key (optional)
- xAI API key (optional)
- ScrapFly API key (for web scraping)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codevanmoose/nukk-nl.git
cd nukk-nl
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
XAI_API_KEY=your_xai_api_key

# Web Scraping
SCRAPFLY_API_KEY=your_scrapfly_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:
```bash
# If using Supabase, run the SQL from database/schema.sql in your Supabase SQL editor
# If using local PostgreSQL:
psql -d your_database < database/schema.sql
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### Basic Analysis
1. Go to the homepage at [nukk.nl](https://nukk.nl)
2. Paste a nu.nl article URL in the input field
3. Click "Analyseer artikel" or press Enter
4. View the objectivity score and detailed multi-model analysis

### URL Redirects
You can also use nukk.nl URLs directly:
- `nukk.nl/politiek/article-title` → automatically analyzes `nu.nl/politiek/article-title`

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── analyse/           # Analysis page
│   └── [[...path]]/       # Catch-all for URL redirects
├── components/            # React components
│   ├── homepage/         # Homepage specific components
│   └── ui/              # Shadcn/ui components
├── lib/                  # Core functionality
│   ├── ai-analyzer.ts    # AI analysis engine
│   ├── content-extractor.ts # Web scraping
│   └── supabase.ts       # Database client
├── types/                # TypeScript type definitions
└── utils/               # Utility functions
```

## API Reference

### POST /api/analyze

Analyzes a nu.nl article URL with a single AI model.

**Request:**
```json
{
  "url": "https://www.nu.nl/article-path"
}
```

**Response:**
```json
{
  "article": {
    "id": "uuid",
    "title": "Article Title",
    "author": "Author Name",
    "nu_url": "https://www.nu.nl/article-path"
  },
  "analysis": {
    "objectivity_score": 75,
    "fact_percentage": 60,
    "opinion_percentage": 25,
    "suggestive_percentage": 10,
    "incomplete_percentage": 5,
    "ai_model": "gpt-4-turbo-preview",
    "processing_time_ms": 3500
  },
  "annotations": []
}
```

### POST /api/analyze-multi

Analyzes a nu.nl article URL with multiple AI models for comparison.

**Request:**
```json
{
  "url": "https://www.nu.nl/article-path",
  "models": ["openai", "anthropic", "grok"]
}
```

**Response:**
```json
{
  "article": { /* same as above */ },
  "analyses": [
    {
      "model": "openai",
      "analysis": { /* analysis object */ },
      "annotations": []
    },
    {
      "model": "anthropic", 
      "analysis": { /* analysis object */ },
      "annotations": []
    },
    {
      "model": "grok",
      "analysis": { /* analysis object */ }, 
      "annotations": []
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run type checking: `npm run typecheck`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@nukk.nl or open an issue on GitHub.

---

Built with ❤️ for media literacy in the Netherlands.
