import puppeteer, { Browser, Page } from 'puppeteer';
import { ExtractedContent } from './scraping-service';

export class CustomScraper {
  private browser: Browser | null = null;

  async initialize() {
    if (this.browser) return;

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        // Anti-detection
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });
  }

  async scrapeNuNl(url: string): Promise<ExtractedContent> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();

    try {
      // Set Dutch locale and timezone
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'language', {
          get: () => 'nl-NL',
        });
        Object.defineProperty(navigator, 'languages', {
          get: () => ['nl-NL', 'nl', 'en'],
        });
      });

      // Set geolocation to Netherlands
      await page.setGeolocation({ latitude: 52.3676, longitude: 4.9041 }); // Amsterdam

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });

      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });

      // Navigate to the page
      console.log(`Scraping: ${url}`);
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()}`);
      }

      // Wait for content to load
      await page.waitForSelector('h1, .article-title, [data-testid="article-title"]', {
        timeout: 10000,
      });

      // Extract content using page.evaluate
      const content = await page.evaluate(() => {
        // Helper function to clean text
        const cleanText = (text: string) => text.trim().replace(/\s+/g, ' ');

        // Extract title
        let title = '';
        const titleSelectors = [
          'h1',
          '.article-title',
          '[data-testid="article-title"]',
          '.headline',
          '.title',
          'meta[property="og:title"]',
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            title = selector.includes('meta') 
              ? element.getAttribute('content') || ''
              : element.textContent || '';
            if (title.trim()) break;
          }
        }

        // Extract author
        let author = '';
        const authorSelectors = [
          '.author-name',
          '.article-author',
          '.byline',
          '[data-testid="author"]',
          '.writer',
          '[itemprop="author"]',
        ];

        for (const selector of authorSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            author = element.textContent || '';
            if (author.trim()) break;
          }
        }

        // Extract publish date
        let publishedAt = new Date().toISOString();
        const dateSelectors = [
          'time[datetime]',
          '.publish-date',
          '.article-date',
          '[data-testid="publish-date"]',
          'meta[property="article:published_time"]',
        ];

        for (const selector of dateSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const dateStr = selector.includes('meta')
              ? element.getAttribute('content')
              : element.getAttribute('datetime') || element.textContent;
            if (dateStr) {
              publishedAt = new Date(dateStr).toISOString();
              break;
            }
          }
        }

        // Extract article content
        let rawContent = '';
        const contentSelectors = [
          'article',
          '.article-body',
          '.article-content',
          '[data-testid="article-body"]',
          '.content',
          '.post-content',
          'main .content',
        ];

        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            // Remove unwanted elements
            const unwantedSelectors = [
              'script',
              'style',
              '.advertisement',
              '.ad',
              '.social-share',
              '.related-articles',
              '.newsletter-signup',
              '.comments',
              'nav',
              'aside',
              '.sidebar',
            ];

            unwantedSelectors.forEach(unwantedSelector => {
              const unwantedElements = element.querySelectorAll(unwantedSelector);
              unwantedElements.forEach(el => el.remove());
            });

            rawContent = element.textContent || '';
            if (rawContent.trim()) break;
          }
        }

        return {
          title: cleanText(title),
          author: author.trim() || null,
          publishedAt,
          rawContent: rawContent.trim(),
        };
      });

      // Clean the content
      const cleanedContent = this.cleanContent(content.rawContent);

      return {
        title: content.title || 'Untitled Article',
        author: content.author,
        publishedAt: new Date(content.publishedAt),
        rawContent: content.rawContent,
        cleanedContent,
      };

    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
    }
  }

  private cleanContent(content: string): string {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit content length
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
let customScraper: CustomScraper | null = null;

export function getCustomScraper(): CustomScraper {
  if (!customScraper) {
    customScraper = new CustomScraper();
  }
  return customScraper;
}

// Cleanup on process exit
process.on('exit', async () => {
  if (customScraper) {
    await customScraper.close();
  }
});

process.on('SIGINT', async () => {
  if (customScraper) {
    await customScraper.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (customScraper) {
    await customScraper.close();
  }
  process.exit(0);
});