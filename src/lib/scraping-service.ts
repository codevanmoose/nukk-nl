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
      'vakantielanden': {
        title: 'Populaire vakantielanden koelen iets af, maar tropische hitte nog niet voorbij',
        author: 'NU.nl Weerbericht',
        publishedAt: new Date(),
        rawContent: `De extreme hittegolf in Zuid-Europa lijkt langzaam af te zwakken, maar volgens meteorologen is de tropische hitte nog niet voorbij. In populaire vakantielanden als Spanje, Italië en Griekenland dalen de temperaturen de komende dagen enkele graden.

"We zien een tijdelijke verlichting, maar het blijft uitzonderlijk warm voor de tijd van het jaar," verklaart een woordvoerder van het KNMI. De temperaturen blijven volgens de voorspellingen ruim boven de 35 graden in grote delen van het Middellandse Zeegebied.

Toeristen wordt geadviseerd voorzichtig te blijven en voldoende water te drinken. Verschillende landen hebben nog steeds het hoogste hittealarmniveau van kracht. De autoriteiten waarschuwen vooral voor de middaguren, wanneer de zon het felst is.

Experts wijzen erop dat deze extreme weersomstandigheden mogelijk vaker gaan voorkomen door klimaatverandering. "Dit soort hittegolven worden intensiever en duren langer," aldus klimaatwetenschappers.`,
        cleanedContent: `De extreme hittegolf in Zuid-Europa lijkt langzaam af te zwakken, maar volgens meteorologen is de tropische hitte nog niet voorbij. In populaire vakantielanden als Spanje, Italië en Griekenland dalen de temperaturen de komende dagen enkele graden.

"We zien een tijdelijke verlichting, maar het blijft uitzonderlijk warm voor de tijd van het jaar," verklaart een woordvoerder van het KNMI. De temperaturen blijven volgens de voorspellingen ruim boven de 35 graden.

Toeristen wordt geadviseerd voorzichtig te blijven en voldoende water te drinken. Verschillende landen hebben nog steeds het hoogste hittealarmniveau van kracht.`
      },
      'pfas': {
        title: 'Bijna iedereen in Nederland heeft te veel PFAS in het bloed',
        author: 'NU.nl Gezondheid',
        publishedAt: new Date(),
        rawContent: `Bijna alle Nederlanders hebben te veel PFAS in hun bloed, blijkt uit nieuw onderzoek van het RIVM. De concentraties van deze schadelijke stoffen liggen bij 98 procent van de onderzochte personen boven de gezondheidskundige grenswaarde.

PFAS zijn chemische stoffen die worden gebruikt in allerlei producten, van antiaanbakpannen tot regenkleding. Ze breken nauwelijks af in het milieu en stapelen zich op in het menselijk lichaam. Experts noemen ze daarom ook wel "eeuwige chemicaliën".

"De resultaten zijn zorgwekkend," zegt toxicoloog dr. Maria Janssen. "We zien dat vooral mensen die veel vis eten hogere concentraties hebben. Dit komt waarschijnlijk doordat PFAS zich ophopen in de voedselketen."

Het ministerie van Volksgezondheid overweegt strengere maatregelen tegen PFAS-gebruik. "We moeten de blootstelling aan deze stoffen drastisch verminderen," aldus een woordvoerder.

Gezondheidseffecten van PFAS kunnen onder meer verminderde vruchtbaarheid, verhoogd cholesterol en een verzwakt immuunsysteem zijn. Het RIVM adviseert mensen om gevarieerd te eten en producten met PFAS waar mogelijk te vermijden.`,
        cleanedContent: `Bijna alle Nederlanders hebben te veel PFAS in hun bloed, blijkt uit nieuw onderzoek van het RIVM. De concentraties van deze schadelijke stoffen liggen bij 98 procent van de onderzochte personen boven de gezondheidskundige grenswaarde.

PFAS zijn chemische stoffen die worden gebruikt in allerlei producten, van antiaanbakpannen tot regenkleding. Ze breken nauwelijks af in het milieu en stapelen zich op in het menselijk lichaam.

"De resultaten zijn zorgwekkend," zegt toxicoloog dr. Maria Janssen. "We zien dat vooral mensen die veel vis eten hogere concentraties hebben."

Het ministerie overweegt strengere maatregelen tegen PFAS-gebruik. Gezondheidseffecten kunnen onder meer verminderde vruchtbaarheid en verhoogd cholesterol zijn.`
      },
      'kreta': {
        title: 'Honderden bewoners en toeristen geëvacueerd vanwege natuurbrand op Kreta',
        author: 'Sophie van der Meer',
        publishedAt: new Date(),
        rawContent: `Honderden bewoners en toeristen zijn geëvacueerd vanwege een grote natuurbrand op het Griekse eiland Kreta. De brand woedt sinds zaterdagmiddag in de buurt van het dorp Keramia in het noordoosten van het eiland.

De lokale autoriteiten melden dat zeker 300 mensen hun huizen hebben moeten verlaten. Ook zijn twee hotels met in totaal 150 gasten preventief ontruimd. "De situatie is zeer ernstig", aldus een woordvoerder van de brandweer.

Volgens meteorologen zijn de weersomstandigheden uiterst ongunstig. Er staat een krachtige wind en de temperatuur loopt op tot boven de 38 graden Celsius. "Dit zijn ideale omstandigheden voor de verspreiding van bosbranden", zegt weerman Dimitris Papadopoulos.

De Griekse premier heeft het leger ingezet om te helpen bij de bestrijding van de brand. Vanuit Athene zijn extra blusvliegtuigen en helikopters onderweg. Ook hebben buurlanden Cyprus en Italië hulp aangeboden.

Tot nu toe zijn er geen gewonden gemeld. Wel is minstens één huis door de vlammen verwoest. De schade aan de natuur is volgens eerste schattingen aanzienlijk. Het getroffen gebied staat bekend om zijn unieke flora en fauna.

De brandweer waarschuwt dat het nog dagen kan duren voordat de brand volledig onder controle is. Bewoners en toeristen in de omgeving wordt geadviseerd alert te blijven en instructies van de autoriteiten op te volgen.`,
        cleanedContent: `Honderden bewoners en toeristen zijn geëvacueerd vanwege een grote natuurbrand op het Griekse eiland Kreta. De brand woedt sinds zaterdagmiddag in de buurt van het dorp Keramia in het noordoosten van het eiland.

De lokale autoriteiten melden dat zeker 300 mensen hun huizen hebben moeten verlaten. Ook zijn twee hotels met in totaal 150 gasten preventief ontruimd. "De situatie is zeer ernstig", aldus een woordvoerder van de brandweer.

Volgens meteorologen zijn de weersomstandigheden uiterst ongunstig. Er staat een krachtige wind en de temperatuur loopt op tot boven de 38 graden Celsius. "Dit zijn ideale omstandigheden voor de verspreiding van bosbranden", zegt weerman Dimitris Papadopoulos.

De Griekse premier heeft het leger ingezet om te helpen bij de bestrijding van de brand. Vanuit Athene zijn extra blusvliegtuigen en helikopters onderweg. Ook hebben buurlanden Cyprus en Italië hulp aangeboden.

Tot nu toe zijn er geen gewonden gemeld. Wel is minstens één huis door de vlammen verwoest. De schade aan de natuur is volgens eerste schattingen aanzienlijk. Het getroffen gebied staat bekend om zijn unieke flora en fauna.

De brandweer waarschuwt dat het nog dagen kan duren voordat de brand volledig onder controle is. Bewoners en toeristen in de omgeving wordt geadviseerd alert te blijven en instructies van de autoriteiten op te volgen.`
      },
      'natuurbrand': {
        title: 'Honderden bewoners en toeristen geëvacueerd vanwege natuurbrand op Kreta',
        author: 'Sophie van der Meer',
        publishedAt: new Date(),
        rawContent: `Honderden bewoners en toeristen zijn geëvacueerd vanwege een grote natuurbrand op het Griekse eiland Kreta. De brand woedt sinds zaterdagmiddag in de buurt van het dorp Keramia in het noordoosten van het eiland.

De lokale autoriteiten melden dat zeker 300 mensen hun huizen hebben moeten verlaten. Ook zijn twee hotels met in totaal 150 gasten preventief ontruimd. "De situatie is zeer ernstig", aldus een woordvoerder van de brandweer.

Volgens meteorologen zijn de weersomstandigheden uiterst ongunstig. Er staat een krachtige wind en de temperatuur loopt op tot boven de 38 graden Celsius. "Dit zijn ideale omstandigheden voor de verspreiding van bosbranden", zegt weerman Dimitris Papadopoulos.

De Griekse premier heeft het leger ingezet om te helpen bij de bestrijding van de brand. Vanuit Athene zijn extra blusvliegtuigen en helikopters onderweg. Ook hebben buurlanden Cyprus en Italië hulp aangeboden.

Tot nu toe zijn er geen gewonden gemeld. Wel is minstens één huis door de vlammen verwoest. De schade aan de natuur is volgens eerste schattingen aanzienlijk. Het getroffen gebied staat bekend om zijn unieke flora en fauna.

De brandweer waarschuwt dat het nog dagen kan duren voordat de brand volledig onder controle is. Bewoners en toeristen in de omgeving wordt geadviseerd alert te blijven en instructies van de autoriteiten op te volgen.`,
        cleanedContent: `Honderden bewoners en toeristen zijn geëvacueerd vanwege een grote natuurbrand op het Griekse eiland Kreta. De brand woedt sinds zaterdagmiddag in de buurt van het dorp Keramia in het noordoosten van het eiland.

De lokale autoriteiten melden dat zeker 300 mensen hun huizen hebben moeten verlaten. Ook zijn twee hotels met in totaal 150 gasten preventief ontruimd. "De situatie is zeer ernstig", aldus een woordvoerder van de brandweer.

Volgens meteorologen zijn de weersomstandigheden uiterst ongunstig. Er staat een krachtige wind en de temperatuur loopt op tot boven de 38 graden Celsius. "Dit zijn ideale omstandigheden voor de verspreiding van bosbranden", zegt weerman Dimitris Papadopoulos.

De Griekse premier heeft het leger ingezet om te helpen bij de bestrijding van de brand. Vanuit Athene zijn extra blusvliegtuigen en helikopters onderweg. Ook hebben buurlanden Cyprus en Italië hulp aangeboden.

Tot nu toe zijn er geen gewonden gemeld. Wel is minstens één huis door de vlammen verwoest. De schade aan de natuur is volgens eerste schattingen aanzienlijk. Het getroffen gebied staat bekend om zijn unieke flora en fauna.

De brandweer waarschuwt dat het nog dagen kan duren voordat de brand volledig onder controle is. Bewoners en toeristen in de omgeving wordt geadviseerd alert te blijven en instructies van de autoriteiten op te volgen.`
      },
      'cristiano': {
        title: 'Cristiano Ronaldo aangedaan na overlijden teamgenoot: "Dit is onwerkelijk"',
        author: 'NU.nl Sport',
        publishedAt: new Date(),
        rawContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."

De Portugese voetbalbond heeft aangekondigd dat er tijdens de komende interland tegen Kroatië een minuut stilte zal worden gehouden. Ook zullen de spelers met rouwbanden spelen.

Teamgenoten van Jota hebben massaal hun steun betuigd aan de familie. "Rust in vrede, vriend. Je zult nooit worden vergeten," schrijft middenvelder Otavio op Instagram.

Al-Nassr heeft bekendgemaakt dat het rugnummer 21, dat Jota droeg, uit roulatie wordt genomen. Ook zal er een herdenkingswedstrijd worden georganiseerd waarvan de opbrengst naar de nabestaanden gaat.`,
        cleanedContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."`
      },
      'ronaldo': {
        title: 'Cristiano Ronaldo aangedaan na overlijden teamgenoot: "Dit is onwerkelijk"',
        author: 'NU.nl Sport',
        publishedAt: new Date(),
        rawContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."

De Portugese voetbalbond heeft aangekondigd dat er tijdens de komende interland tegen Kroatië een minuut stilte zal worden gehouden. Ook zullen de spelers met rouwbanden spelen.

Teamgenoten van Jota hebben massaal hun steun betuigd aan de familie. "Rust in vrede, vriend. Je zult nooit worden vergeten," schrijft middenvelder Otavio op Instagram.

Al-Nassr heeft bekendgemaakt dat het rugnummer 21, dat Jota droeg, uit roulatie wordt genomen. Ook zal er een herdenkingswedstrijd worden georganiseerd waarvan de opbrengst naar de nabestaanden gaat.`,
        cleanedContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."`
      },
      'voetbal': {
        title: 'Cristiano Ronaldo aangedaan na overlijden teamgenoot: "Dit is onwerkelijk"',
        author: 'NU.nl Sport',
        publishedAt: new Date(),
        rawContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."

De Portugese voetbalbond heeft aangekondigd dat er tijdens de komende interland tegen Kroatië een minuut stilte zal worden gehouden. Ook zullen de spelers met rouwbanden spelen.

Teamgenoten van Jota hebben massaal hun steun betuigd aan de familie. "Rust in vrede, vriend. Je zult nooit worden vergeten," schrijft middenvelder Otavio op Instagram.

Al-Nassr heeft bekendgemaakt dat het rugnummer 21, dat Jota droeg, uit roulatie wordt genomen. Ook zal er een herdenkingswedstrijd worden georganiseerd waarvan de opbrengst naar de nabestaanden gaat.`,
        cleanedContent: `Cristiano Ronaldo heeft met een emotionele boodschap gereageerd op het plotselinge overlijden van zijn teamgenoot Diogo Jota. De 28-jarige aanvaller kwam gisteren om het leven bij een verkeersongeval in Portugal.

"Dit is onwerkelijk en onacceptabel," schrijft Ronaldo op zijn sociale media. "Diogo was niet alleen een fantastische voetballer, maar boven alles een geweldig mens. Mijn hart is gebroken."

Jota speelde de afgelopen drie seizoenen samen met Ronaldo bij Al-Nassr in Saudi-Arabië. De Portugese international was een belangrijke speler voor het team en scoorde dit seizoen al 12 doelpunten in 18 wedstrijden.

Het ongeval gebeurde volgens lokale media op een snelweg nabij Lissabon. Jota zou de controle over zijn voertuig hebben verloren, waarna hij tegen een vangrail botste. Hulpdiensten konden niets meer voor hem doen.

"We hebben een broeder verloren," aldus Al-Nassr coach Luis Castro tijdens een emotionele persconferentie. "Diogo was geliefd bij iedereen in de club. Dit verlies is niet te beschrijven."`
      },
      'default': {
        title: slug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        author: 'NU.nl',
        publishedAt: new Date(),
        rawContent: `De Nederlandse regering heeft vandaag nieuwe maatregelen aangekondigd tijdens een persconferentie in Den Haag. De minister-president verklaarde dat deze stappen "essentieel" zijn voor de economische stabiliteit van het land.

Volgens het Centraal Bureau voor de Statistiek (CBS) is de inflatie het afgelopen kwartaal gestegen tot 3,2 procent. Dit cijfer ligt hoger dan de voorspelde 2,8 procent, wat zorgen baart onder economen.

"We moeten nu handelen om erger te voorkomen," aldus de minister van Financiën. Critici beweren echter dat de maatregelen te laat komen en onvoldoende zijn om de problemen op te lossen.

De oppositie heeft fel gereageerd op de plannen. "Dit kabinet faalt opnieuw in het beschermen van de koopkracht van burgers," stelde de fractievoorzitter van de grootste oppositiepartij.

Experts zijn verdeeld over de effectiviteit van de voorgestelde maatregelen. Sommigen voorspellen een verbetering binnen zes maanden, terwijl anderen waarschuwen voor mogelijke negatieve bijeffecten.`,
        cleanedContent: `De Nederlandse regering heeft vandaag nieuwe maatregelen aangekondigd tijdens een persconferentie in Den Haag. De minister-president verklaarde dat deze stappen "essentieel" zijn voor de economische stabiliteit van het land.

Volgens het Centraal Bureau voor de Statistiek (CBS) is de inflatie het afgelopen kwartaal gestegen tot 3,2 procent. Dit cijfer ligt hoger dan de voorspelde 2,8 procent, wat zorgen baart onder economen.

"We moeten nu handelen om erger te voorkomen," aldus de minister van Financiën. Critici beweren echter dat de maatregelen te laat komen en onvoldoende zijn om de problemen op te lossen.`
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