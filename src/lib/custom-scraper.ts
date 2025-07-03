import puppeteer, { Browser, Page } from 'puppeteer';
import { ExtractedContent } from './scraping-service';

export class CustomScraper {
  private browser: Browser | null = null;

  async initialize() {
    if (this.browser) return;

    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    if (isVercel || isProduction) {
      // For serverless environments, use a simpler approach
      console.log('Serverless environment detected, skipping Puppeteer initialization');
      return;
    }

    // Only use Puppeteer in local development
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
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });
  }

  async scrapeNuNl(url: string): Promise<ExtractedContent> {
    await this.initialize();
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    if (isVercel || isProduction || !this.browser) {
      // Use simple fetch approach for serverless environments
      return this.scrapeWithFetch(url);
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

  private async scrapeWithFetch(url: string): Promise<ExtractedContent> {
    try {
      console.log(`Scraping with fetch: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      return this.parseHtmlContent(html, url);
    } catch (error) {
      console.error('Fetch scraping failed:', error);
      throw new Error(`Failed to scrape with fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseHtmlContent(html: string, url: string): ExtractedContent {
    // Simple HTML parsing without DOM (for serverless environments)
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is) ||
                      html.match(/<h1[^>]*>(.*?)<\/h1>/is) ||
                      html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"[^>]*>/is);
    
    let title = 'Untitled Article';
    if (titleMatch) {
      title = this.decodeHtml(titleMatch[1]).replace(/\s+/g, ' ').trim();
    }

    // Extract author
    const authorMatch = html.match(/class="author[^"]*"[^>]*>(.*?)<\/[^>]+>/is) ||
                       html.match(/door\s+([^<\n]+)/i) ||
                       html.match(/<meta[^>]+name="author"[^>]+content="([^"]*)"[^>]*>/is);
    
    let author: string | null = null;
    if (authorMatch) {
      author = this.decodeHtml(authorMatch[1]).trim();
    }

    // Extract publish date
    const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/i) ||
                     html.match(/<meta[^>]+property="article:published_time"[^>]+content="([^"]*)"[^>]*>/is);
    
    let publishedAt = new Date();
    if (dateMatch) {
      publishedAt = new Date(dateMatch[1]);
    }

    // Extract content - look for article body
    const contentMatches = [
      html.match(/<article[^>]*>(.*?)<\/article>/is),
      html.match(/class="article-body[^"]*"[^>]*>(.*?)<\/div>/is),
      html.match(/class="content[^"]*"[^>]*>(.*?)<\/div>/is),
    ];

    let rawContent = '';
    for (const match of contentMatches) {
      if (match) {
        rawContent = match[1];
        break;
      }
    }

    if (!rawContent) {
      // Fallback: try to extract text between common patterns
      const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
      if (bodyMatch) {
        rawContent = bodyMatch[1];
      }
    }

    // Clean HTML tags and decode entities
    rawContent = rawContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<aside[^>]*>.*?<\/aside>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/class="[^"]*ad[^"]*"[^>]*>.*?<\/[^>]+>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    rawContent = this.decodeHtml(rawContent);
    const cleanedContent = this.cleanContent(rawContent);

    return {
      title,
      author,
      publishedAt,
      rawContent,
      cleanedContent,
    };
  }

  private decodeHtml(html: string): string {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"');
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