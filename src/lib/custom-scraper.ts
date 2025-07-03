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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Scraping with fetch (attempt ${attempt}): ${url}`);
        
        const headers = this.getRandomHeaders();
        console.log('Using User-Agent:', headers['User-Agent']);

        const response = await fetch(url, {
          headers,
          redirect: 'follow',
          referrer: 'https://www.google.com/',
        });

        if (!response.ok) {
          if (response.status === 403 && attempt < maxRetries) {
            console.log(`403 Forbidden, retrying with different headers (attempt ${attempt + 1})`);
            await this.delay(1000 * attempt); // Progressive delay
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        return this.parseHtmlContent(html, url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Fetch attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          await this.delay(2000 * attempt); // Progressive delay
        }
      }
    }

    console.error('All fetch attempts failed:', lastError);
    throw new Error(`Failed to scrape with fetch after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  private getRandomHeaders(): Record<string, string> {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    ];

    const acceptLanguages = [
      'nl-NL,nl;q=0.9,en;q=0.8',
      'nl,en-US;q=0.9,en;q=0.8',
      'nl-NL,nl;q=0.8,en-US;q=0.5,en;q=0.3',
    ];

    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const randomAcceptLanguage = acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];

    return {
      'User-Agent': randomUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': randomAcceptLanguage,
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private parseHtmlContent(html: string, url: string): ExtractedContent {
    console.log('Parsing HTML content, length:', html.length);
    
    // Extract title - nu.nl specific patterns
    const titlePatterns = [
      /<meta[^>]+property="og:title"[^>]+content="([^"]*)"[^>]*>/is,
      /<title[^>]*>([^<]*)<\/title>/is,
      /<h1[^>]*class="[^"]*headline[^"]*"[^>]*>([^<]*)<\/h1>/is,
      /<h1[^>]*>([^<]*)<\/h1>/is,
    ];
    
    let title = 'Untitled Article';
    for (const pattern of titlePatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        title = this.decodeHtml(match[1]).replace(/\s+/g, ' ').trim();
        // Remove "NU.nl" suffix if present
        title = title.replace(/\s*-\s*NU\.nl\s*$/i, '').trim();
        break;
      }
    }

    // Extract author - nu.nl specific patterns
    const authorPatterns = [
      /class="[^"]*author[^"]*"[^>]*>([^<]+)<\/[^>]+>/is,
      /door\s+([^<\n\r]+)/i,
      /<meta[^>]+name="author"[^>]+content="([^"]*)"[^>]*>/is,
      /redactie[^<]*:\s*([^<\n\r]+)/i,
    ];
    
    let author: string | null = null;
    for (const pattern of authorPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        author = this.decodeHtml(match[1]).trim();
        break;
      }
    }

    // Extract publish date
    const datePatterns = [
      /<meta[^>]+property="article:published_time"[^>]+content="([^"]*)"[^>]*>/is,
      /<time[^>]*datetime="([^"]+)"/i,
      /<meta[^>]+name="date"[^>]+content="([^"]*)"[^>]*>/is,
    ];
    
    let publishedAt = new Date();
    for (const pattern of datePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          publishedAt = new Date(match[1]);
          if (!isNaN(publishedAt.getTime())) break;
        } catch (e) {
          // Continue to next pattern
        }
      }
    }

    // Extract content - nu.nl specific patterns
    const contentPatterns = [
      // Try to find main article content
      /<article[^>]*>(.*?)<\/article>/is,
      /class="[^"]*article-body[^"]*"[^>]*>(.*?)<\/div>/is,
      /class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/is,
      /data-testid="article-body"[^>]*>(.*?)<\/div>/is,
      // Fallback to main content area
      /<main[^>]*>(.*?)<\/main>/is,
    ];

    let rawContent = '';
    for (const pattern of contentPatterns) {
      const match = html.match(pattern);
      if (match && match[1].trim()) {
        rawContent = match[1];
        console.log('Found content using pattern:', pattern.source.substring(0, 50) + '...');
        break;
      }
    }

    if (!rawContent) {
      console.log('No content found with specific patterns, trying fallback');
      // Fallback: extract everything and filter later
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
      .replace(/class="[^"]*advertisement[^"]*"[^>]*>.*?<\/[^>]+>/gis, '')
      .replace(/class="[^"]*social[^"]*"[^>]*>.*?<\/[^>]+>/gis, '')
      .replace(/class="[^"]*share[^"]*"[^>]*>.*?<\/[^>]+>/gis, '')
      .replace(/class="[^"]*related[^"]*"[^>]*>.*?<\/[^>]+>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    rawContent = this.decodeHtml(rawContent);
    const cleanedContent = this.cleanContent(rawContent);

    console.log('Parsed content:', {
      title: title.substring(0, 100),
      author,
      contentLength: cleanedContent.length
    });

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