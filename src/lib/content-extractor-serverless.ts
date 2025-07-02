import { JSDOM } from 'jsdom';

export interface ExtractedContent {
  title: string;
  author?: string;
  publishedAt?: Date;
  rawContent: string;
  cleanedContent: string;
}

export class ContentExtractor {
  async extractFromNuNl(url: string): Promise<ExtractedContent> {
    try {
      // Fetch the HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Extract title
      const titleElement = document.querySelector('h1') || 
                         document.querySelector('meta[property="og:title"]');
      const title = titleElement?.textContent?.trim() || 
                   titleElement?.getAttribute('content') || 
                   'Untitled Article';

      // Extract author
      const authorElement = document.querySelector('.author-name') ||
                           document.querySelector('[itemprop="author"]') ||
                           document.querySelector('.article-author');
      const author = authorElement?.textContent?.trim();

      // Extract date
      const dateElement = document.querySelector('time[datetime]') ||
                         document.querySelector('.article-date') ||
                         document.querySelector('[itemprop="datePublished"]');
      const dateStr = dateElement?.getAttribute('datetime') || 
                     dateElement?.textContent?.trim();
      const publishedAt = dateStr ? new Date(dateStr) : undefined;

      // Extract article content
      const articleSelectors = [
        'article',
        '.article-body',
        '.content',
        '[itemprop="articleBody"]',
        '.article-content',
        'main'
      ];

      let contentElement = null;
      for (const selector of articleSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) break;
      }

      if (!contentElement) {
        throw new Error('Could not find article content');
      }

      // Remove unwanted elements
      const elementsToRemove = contentElement.querySelectorAll(
        'script, style, nav, aside, .advertisement, .social-share, .related-articles'
      );
      elementsToRemove.forEach(el => el.remove());

      // Get text content
      const rawContent = contentElement.textContent || '';
      
      // Clean the content
      const cleanedContent = rawContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n\n');

      return {
        title,
        author,
        publishedAt,
        rawContent,
        cleanedContent
      };
    } catch (error) {
      console.error('Error extracting content:', error);
      throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Compatibility methods for existing interface
  async initialize() {
    // No initialization needed for fetch-based approach
  }

  async close() {
    // No cleanup needed
  }
}

// Singleton instance
let extractorInstance: ContentExtractor | null = null;

export function getContentExtractor(): ContentExtractor {
  if (!extractorInstance) {
    extractorInstance = new ContentExtractor();
  }
  return extractorInstance;
}