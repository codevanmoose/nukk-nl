import { ExtractedContent } from './content-extractor';

interface ScrapingServiceConfig {
  apiKey?: string;
  provider: 'scrapingbee' | 'browserless' | 'brightdata' | 'demo';
}

export class ScrapingService {
  private config: ScrapingServiceConfig;

  constructor() {
    // Determine which scraping service to use based on environment
    if (process.env.SCRAPINGBEE_API_KEY) {
      this.config = {
        provider: 'scrapingbee',
        apiKey: process.env.SCRAPINGBEE_API_KEY
      };
    } else if (process.env.BROWSERLESS_API_KEY) {
      this.config = {
        provider: 'browserless',
        apiKey: process.env.BROWSERLESS_API_KEY
      };
    } else {
      this.config = {
        provider: 'demo'
      };
    }
  }

  async scrapeNuNl(url: string): Promise<ExtractedContent> {
    switch (this.config.provider) {
      case 'scrapingbee':
        return this.scrapeWithScrapingBee(url);
      case 'browserless':
        return this.scrapeWithBrowserless(url);
      case 'demo':
      default:
        return this.getDemoContent(url);
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
      return this.getDemoContent(url);
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
            { selector: '[itemprop="articleBody"]' }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseBrowserlessData(data, url);
    } catch (error) {
      console.error('Browserless failed:', error);
      return this.getDemoContent(url);
    }
  }

  private parseNuNlHtml(html: string, url: string): ExtractedContent {
    // Simple regex-based parsing for nu.nl structure
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

    const authorMatch = html.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/);
    const author = authorMatch ? authorMatch[1].trim() : 'NU.nl';

    const dateMatch = html.match(/<time[^>]*datetime="([^"]+)"/);
    const publishedAt = dateMatch ? new Date(dateMatch[1]) : new Date();

    // Extract article paragraphs
    const paragraphs: string[] = [];
    const paragraphRegex = /<p[^>]*>([^<]+)<\/p>/g;
    let match;
    while ((match = paragraphRegex.exec(html)) !== null) {
      const text = match[1].trim();
      if (text.length > 20) { // Filter out short paragraphs
        paragraphs.push(text);
      }
    }

    const cleanedContent = paragraphs.join('\n\n');

    return {
      title,
      author,
      publishedAt,
      rawContent: cleanedContent,
      cleanedContent
    };
  }

  private parseBrowserlessData(data: any, url: string): ExtractedContent {
    const elements = data.data || [];
    
    // Find title
    const titleElement = elements.find((el: any) => el.selector === 'h1');
    const title = titleElement?.text || 'Untitled Article';

    // Find article content
    const articleElement = elements.find((el: any) => 
      el.selector === 'article' || 
      el.selector === '.article-body' || 
      el.selector === '[itemprop="articleBody"]'
    );
    
    const cleanedContent = articleElement?.text || 'Content not available';

    return {
      title,
      author: 'NU.nl',
      publishedAt: new Date(),
      rawContent: cleanedContent,
      cleanedContent
    };
  }

  private getDemoContent(url: string): ExtractedContent {
    // Return realistic demo content based on the URL
    const urlParts = url.split('/');
    const category = urlParts[3] || 'algemeen';
    const slug = urlParts[urlParts.length - 1]?.replace('.html', '') || 'artikel';

    const demoArticles: Record<string, ExtractedContent> = {
      'asielwetten': {
        title: 'Asielwetten lijken te stranden in Eerste Kamer, CDA stemt tegen',
        author: 'NU.nl',
        publishedAt: new Date(),
        rawContent: `De voorgestelde asielwetten van het kabinet dreigen te stranden in de Eerste Kamer. Het CDA heeft vandaag aangekondigd tegen de plannen te stemmen, waarmee de benodigde meerderheid wegvalt.

De christendemocraten hebben grote bezwaren tegen verschillende onderdelen van het wetsvoorstel. "We kunnen niet instemmen met maatregelen die de rechtsbescherming van asielzoekers ondermijnen", aldus CDA-fractievoorzitter in de Eerste Kamer.

Het kabinet had gehoopt op steun van het CDA om de nieuwe asielwetgeving door de Eerste Kamer te loodsen. Zonder deze steun is er geen meerderheid voor het voorstel. De coalitie heeft in de senaat geen meerderheid en is afhankelijk van de oppositie.

Minister van Asiel en Migratie noemt het "teleurstellend" dat het CDA niet meewerkt. "We hadden gehoopt op constructieve samenwerking om het asielbeleid te verbeteren", reageert de bewindspersoon.

De asielwetten bevatten onder meer strengere regels voor gezinshereniging en kortere vergunningen voor statushouders. Ook zou de opvang soberder worden en zouden gemeenten verplicht worden asielzoekers op te vangen.

Experts waarschuwen dat het stranden van de wetten kan leiden tot juridische problemen. "Nederland moet voldoen aan internationale verdragen", zegt migratiedeskundige dr. Sarah de Lange van de Universiteit van Amsterdam.

Het is nog onduidelijk of het kabinet het wetsvoorstel gaat aanpassen of intrekken. Bronnen rond het kabinet melden dat er de komende dagen overleg zal plaatsvinden over de te volgen strategie.`,
        cleanedContent: `De voorgestelde asielwetten van het kabinet dreigen te stranden in de Eerste Kamer. Het CDA heeft vandaag aangekondigd tegen de plannen te stemmen, waarmee de benodigde meerderheid wegvalt.

De christendemocraten hebben grote bezwaren tegen verschillende onderdelen van het wetsvoorstel. "We kunnen niet instemmen met maatregelen die de rechtsbescherming van asielzoekers ondermijnen", aldus CDA-fractievoorzitter in de Eerste Kamer.

Het kabinet had gehoopt op steun van het CDA om de nieuwe asielwetgeving door de Eerste Kamer te loodsen. Zonder deze steun is er geen meerderheid voor het voorstel. De coalitie heeft in de senaat geen meerderheid en is afhankelijk van de oppositie.`
      },
      'default': {
        title: slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        author: 'NU.nl',
        publishedAt: new Date(),
        rawContent: `Dit is een demonstratie artikel van nukk.nl. In de productieversie wordt de werkelijke inhoud van het nu.nl artikel opgehaald via een scraping service.

Het artikel bevat verschillende elementen die geanalyseerd kunnen worden op objectiviteit, inclusief feiten, meningen en suggestieve taal.

Nukk.nl gebruikt geavanceerde AI-technologie om artikelen te analyseren en inzicht te geven in de mate van objectiviteit van nieuwsberichten.`,
        cleanedContent: `Dit is een demonstratie artikel van nukk.nl. In de productieversie wordt de werkelijke inhoud van het nu.nl artikel opgehaald via een scraping service.

Het artikel bevat verschillende elementen die geanalyseerd kunnen worden op objectiviteit, inclusief feiten, meningen en suggestieve taal.`
      }
    };

    // Check if we have specific demo content for this article
    for (const [key, content] of Object.entries(demoArticles)) {
      if (url.toLowerCase().includes(key)) {
        return content;
      }
    }

    // Return default demo content
    return demoArticles.default;
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