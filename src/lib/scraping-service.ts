export interface ExtractedContent {
  title: string;
  author: string | null;
  publishedAt: Date;
  rawContent: string;
  cleanedContent: string;
}

export class ScrapingService {
  private config: {
    provider: 'scrapfly';
    apiKey: string | null;
  };

  constructor() {
    // Use ScrapFly as the only scraping method
    this.config = {
      provider: 'scrapfly',
      apiKey: process.env.SCRAPFLY_API_KEY || null
    };
  }

  async scrapeNuNl(url: string): Promise<ExtractedContent> {
    // Check if ScrapFly API key is configured
    if (!this.config.apiKey) {
      throw new Error('ScrapFly API key not configured. Please set SCRAPFLY_API_KEY environment variable.');
    }

    try {
      console.log('Scraping with ScrapFly...');
      return await this.scrapeWithScrapFly(url);
    } catch (error) {
      console.error('ScrapFly failed:', error);
      throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  private async scrapeWithScrapFly(url: string): Promise<ExtractedContent> {
    const apiUrl = new URL('https://api.scrapfly.io/scrape');
    apiUrl.searchParams.append('key', this.config.apiKey!);
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('render_js', 'true');
    apiUrl.searchParams.append('country', 'NL');
    apiUrl.searchParams.append('format', 'json');
    apiUrl.searchParams.append('asp', 'true'); // Enable anti-scraping protection bypass
    apiUrl.searchParams.append('retry', 'true'); // Enable automatic retries
    apiUrl.searchParams.append('proxy_pool', 'public_residential_pool'); // Use residential proxies
    apiUrl.searchParams.append('session', 'nu-nl-session'); // Use session for consistency

    try {
      console.log('ScrapFly request URL:', apiUrl.toString().replace(this.config.apiKey!, 'REDACTED'));
      
      const response = await fetch(apiUrl.toString());
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('ScrapFly response:', responseText);
        throw new Error(`ScrapFly error: ${response.status} - ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse ScrapFly response:', responseText);
        throw new Error('Invalid JSON response from ScrapFly');
      }

      const html = result.result?.content || '';
      
      if (!html) {
        console.error('ScrapFly result:', result);
        throw new Error('No content received from ScrapFly');
      }

      console.log('ScrapFly successfully retrieved content, length:', html.length);
      return this.parseNuNlHtml(html, url);
    } catch (error) {
      console.error('ScrapFly failed:', error);
      throw new Error(`Failed to scrape article with ScrapFly: ${error instanceof Error ? error.message : 'Unknown error'}`);
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