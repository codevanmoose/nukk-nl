// For Vercel deployment, we must use a serverless approach
// Neither Puppeteer nor Playwright work on Vercel serverless functions
export * from './content-extractor-serverless';

export interface ExtractedContent {
  title: string;
  author?: string;
  publishedAt?: Date;
  rawContent: string;
  cleanedContent: string;
}

export class ContentExtractor {
  private browser: Browser | null = null;

  async initialize() {
    if (this.browser) return;
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-extensions',
      ],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async extractFromNuNl(url: string): Promise<ExtractedContent> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    try {
      // Set user agent to avoid blocking
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // Navigate to the article
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await page.waitForSelector('article, .article-content, [data-testid="article-content"]', {
        timeout: 10000
      });

      // Extract article data
      const extracted = await page.evaluate(() => {
        // Try different selectors for title
        const titleSelectors = [
          'h1[data-testid="title"]',
          'h1.article-title',
          'h1',
          '.article-header h1',
          '[data-testid="article-title"]'
        ];
        
        let title = '';
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            title = element.textContent.trim();
            break;
          }
        }

        // Try different selectors for author
        const authorSelectors = [
          '[data-testid="author"]',
          '.article-author',
          '.byline',
          '.author-name',
          '.article-meta .author'
        ];
        
        let author = '';
        for (const selector of authorSelectors) {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            author = element.textContent.trim();
            break;
          }
        }

        // Try different selectors for published date
        const dateSelectors = [
          '[data-testid="publish-date"]',
          '.article-date',
          '.publish-date',
          'time',
          '.article-meta time'
        ];
        
        let publishedAt = '';
        for (const selector of dateSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            publishedAt = element.getAttribute('datetime') || element.textContent?.trim() || '';
            if (publishedAt) break;
          }
        }

        // Extract main content
        const contentSelectors = [
          '[data-testid="article-content"]',
          '.article-content',
          '.article-body',
          'article .content',
          '.main-content'
        ];
        
        let rawContent = '';
        let cleanedContent = '';
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            rawContent = element.innerHTML;
            
            // Clean content by removing ads, navigation, etc.
            const clone = element.cloneNode(true) as Element;
            
            // Remove unwanted elements
            const unwantedSelectors = [
              '.advertisement',
              '.ad',
              '.social-share',
              '.related-articles',
              '.newsletter-signup',
              '.comments',
              '.sidebar',
              '.navigation',
              'script',
              'style',
              '.cookie-banner'
            ];
            
            unwantedSelectors.forEach(sel => {
              clone.querySelectorAll(sel).forEach(el => el.remove());
            });
            
            cleanedContent = clone.textContent?.trim() || '';
            break;
          }
        }

        return {
          title,
          author: author || undefined,
          publishedAt: publishedAt || undefined,
          rawContent,
          cleanedContent
        };
      });

      // Parse published date if available
      let parsedDate: Date | undefined;
      if (extracted.publishedAt) {
        try {
          parsedDate = new Date(extracted.publishedAt);
          if (isNaN(parsedDate.getTime())) {
            parsedDate = undefined;
          }
        } catch {
          parsedDate = undefined;
        }
      }

      return {
        title: extracted.title || 'Untitled Article',
        author: extracted.author,
        publishedAt: parsedDate,
        rawContent: extracted.rawContent,
        cleanedContent: extracted.cleanedContent
      };

    } finally {
      await page.close();
    }
  }
}

// Singleton instance
let contentExtractor: ContentExtractor | null = null;

export async function getContentExtractor(): Promise<ContentExtractor> {
  if (!contentExtractor) {
    contentExtractor = new ContentExtractor();
    await contentExtractor.initialize();
  }
  return contentExtractor;
}

export async function closeContentExtractor() {
  if (contentExtractor) {
    await contentExtractor.close();
    contentExtractor = null;
  }
}