export interface ExtractedContent {
  title: string;
  author: string | null;
  publishedAt: Date;
  rawContent: string;
  cleanedContent: string;
}

export class ScrapingService {
  private config: {
    provider: 'custom' | 'scrapingbee' | 'scrapfly' | 'browserless';
    apiKey: string | null;
  };

  constructor() {
    // Always start with custom scraper, fallback to external services if available
    this.config = {
      provider: 'custom',
      apiKey: null
    };
  }

  async scrapeNuNl(url: string): Promise<ExtractedContent> {
    // Try custom scraper first
    try {
      console.log('Attempting scraping with custom scraper...');
      return await this.scrapeWithCustomScraper(url);
    } catch (customError) {
      console.error('Custom scraper failed:', customError);
      
      // Fallback to ScrapingBee if available
      if (process.env.SCRAPINGBEE_API_KEY) {
        try {
          console.log('Falling back to ScrapingBee...');
          this.config = { provider: 'scrapingbee', apiKey: process.env.SCRAPINGBEE_API_KEY };
          return await this.scrapeWithScrapingBee(url);
        } catch (scrapingBeeError) {
          console.error('ScrapingBee fallback failed:', scrapingBeeError);
        }
      }
      
      // Fallback to ScrapFly if available
      if (process.env.SCRAPFLY_API_KEY) {
        try {
          console.log('Falling back to ScrapFly...');
          this.config = { provider: 'scrapfly', apiKey: process.env.SCRAPFLY_API_KEY };
          return await this.scrapeWithScrapFly(url);
        } catch (scrapFlyError) {
          console.error('ScrapFly fallback failed:', scrapFlyError);
        }
      }
      
      // Fallback to Browserless if available
      if (process.env.BROWSERLESS_API_KEY) {
        try {
          console.log('Falling back to Browserless...');
          this.config = { provider: 'browserless', apiKey: process.env.BROWSERLESS_API_KEY };
          return await this.scrapeWithBrowserless(url);
        } catch (browserlessError) {
          console.error('Browserless fallback failed:', browserlessError);
        }
      }
      
      // If all methods fail, throw the original custom scraper error
      throw new Error(`All scraping methods failed. Custom scraper error: ${customError instanceof Error ? customError.message : 'Unknown error'}`);
    }
  }

  private async scrapeWithCustomScraper(url: string): Promise<ExtractedContent> {
    const { getCustomScraper } = await import('./custom-scraper');
    const scraper = getCustomScraper();
    
    try {
      return await scraper.scrapeNuNl(url);
    } catch (error) {
      console.error('Custom scraper failed:', error);
      throw new Error(`Failed to scrape article with custom scraper: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async scrapeWithScrapingBee(url: string): Promise<ExtractedContent> {
    const apiUrl = new URL('https://app.scrapingbee.com/api/v1/');
    apiUrl.searchParams.append('api_key', this.config.apiKey!);
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('render_js', 'true');
    apiUrl.searchParams.append('premium_proxy', 'true');
    apiUrl.searchParams.append('country_code', 'nl');

    try {
      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`ScrapingBee error: ${response.status}`);
      }

      const html = await response.text();
      return this.parseNuNlHtml(html, url);
    } catch (error) {
      console.error('ScrapingBee failed:', error);
      throw new Error('Failed to scrape article with ScrapingBee');
    }
  }

  private async scrapeWithScrapFly(url: string): Promise<ExtractedContent> {
    const apiUrl = new URL('https://api.scrapfly.io/scrape');
    apiUrl.searchParams.append('key', this.config.apiKey!);
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('render_js', 'true');
    apiUrl.searchParams.append('country', 'NL');
    apiUrl.searchParams.append('format', 'json');

    try {
      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`ScrapFly error: ${response.status}`);
      }

      const result = await response.json();
      const html = result.result?.content || '';
      
      if (!html) {
        throw new Error('No content received from ScrapFly');
      }

      return this.parseNuNlHtml(html, url);
    } catch (error) {
      console.error('ScrapFly failed:', error);
      throw new Error('Failed to scrape article with ScrapFly');
    }
  }

  private async scrapeWithBrowserless(url: string): Promise<ExtractedContent> {
    const apiUrl = `https://chrome.browserless.io/content?token=${this.config.apiKey}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          waitFor: 2000,
          elements: [
            { selector: 'h1' },
            { selector: 'article' },
            { selector: '.article-body' },
            { selector: '[data-type="article.body"]' },
            { selector: 'time' },
            { selector: '.author' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }

      const result = await response.json();
      return this.parseBrowserlessResult(result, url);
    } catch (error) {
      console.error('Browserless failed:', error);
      throw new Error('Failed to scrape article with Browserless');
    }
  }

  private parseNuNlHtml(html: string, url: string): ExtractedContent {
    // Use regex patterns to extract content from HTML
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    const title = titleMatch ? this.decodeHtml(titleMatch[1]) : 'Untitled Article';

    const authorMatch = html.match(/class="author"[^>]*>(.*?)<\/[^>]+>/is) ||
                       html.match(/by\s+([^<]+)/i);
    const author = authorMatch ? this.decodeHtml(authorMatch[1]).trim() : null;

    const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
    const publishedAt = timeMatch ? new Date(timeMatch[1]) : new Date();

    // Extract article body
    const articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/is) ||
                        html.match(/class="article-body"[^>]*>(.*?)<\/div>/is);
    
    let rawContent = '';
    if (articleMatch) {
      // Remove script and style tags
      rawContent = articleMatch[1]
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      rawContent = this.decodeHtml(rawContent);
    }

    const cleanedContent = this.cleanContent(rawContent);

    return {
      title,
      author,
      publishedAt,
      rawContent,
      cleanedContent
    };
  }

  private parseBrowserlessResult(result: any, url: string): ExtractedContent {
    // Extract data from Browserless response
    const data = result.data || [];
    
    let title = 'Untitled Article';
    let author: string | null = null;
    let publishedAt = new Date();
    let rawContent = '';

    // Find relevant data
    for (const item of data) {
      if (item.selector === 'h1' && item.text) {
        title = item.text[0] || title;
      }
      if (item.selector === '.author' && item.text) {
        author = item.text[0];
      }
      if (item.selector === 'time' && item.attributes?.datetime) {
        publishedAt = new Date(item.attributes.datetime);
      }
      if ((item.selector === 'article' || item.selector === '.article-body') && item.text) {
        rawContent = item.text.join(' ');
      }
    }

    const cleanedContent = this.cleanContent(rawContent);

    return {
      title,
      author,
      publishedAt,
      rawContent,
      cleanedContent
    };
  }

  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 5000); // Limit content length
  }

  private decodeHtml(html: string): string {
    return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }
}

// Singleton instance
let scrapingService: ScrapingService | null = null;

export function getScrapingService(): ScrapingService {
  if (!scrapingService) {
    scrapingService = new ScrapingService();
  }
  return scrapingService;
}