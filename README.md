# nukk.nl - AI-powered Fact-Checking Platform

nukk.nl is an innovative fact-checking platform that brings transparency to Dutch news consumption by automatically analyzing nu.nl articles for subjectivity, opinion-as-fact presentation, and incomplete framing.

## Features

- 🔍 **URL Analysis**: Simply paste a nu.nl URL to get instant fact-checking
- 🧠 **AI-Powered**: Uses OpenAI GPT-4 with Anthropic Claude fallback for analysis
- 📊 **Objectivity Scoring**: Get a 0-100 objectivity score with detailed breakdown
- 🎯 **Content Classification**: Identifies facts, opinions, suggestive language, and incomplete information
- 🔄 **Smart Redirects**: Support nukk.nl/path URLs that automatically redirect to analysis
- 💾 **Caching**: Stores analyses to avoid re-processing the same articles

## Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **AI**: OpenAI GPT-4, Anthropic Claude 3 (fallback)
- **Database**: PostgreSQL (Supabase)
- **Web Scraping**: Puppeteer
- **Deployment**: Vercel (frontend), Google Cloud Run (backend)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Supabase account)
- OpenAI API key
- Anthropic API key (optional, for fallback)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/nukk.git
cd nukk
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

# Redis (optional, for production)
REDIS_URL=redis://localhost:6379

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
1. Go to the homepage
2. Paste a nu.nl article URL
3. Click "Analyseer artikel"
4. View the objectivity score and breakdown

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

Analyzes a nu.nl article URL.

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
