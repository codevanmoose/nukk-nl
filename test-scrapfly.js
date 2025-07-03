// Test ScrapFly integration
async function testScrapFly() {
  // Hardcode the API key for testing
  const apiKey = 'scp-live-b1ab2b60357145759b59cbdb9c63d578';
  
  if (!apiKey) {
    console.error('SCRAPFLY_API_KEY not found in environment variables');
    return;
  }
  
  console.log('Testing ScrapFly with API key:', apiKey.substring(0, 10) + '...');
  
  const testUrl = 'https://www.nu.nl/economie/6334162/opnieuw-recordaantal-klachten-over-pakketbezorgers-in-2024.html';
  
  const apiUrl = new URL('https://api.scrapfly.io/scrape');
  apiUrl.searchParams.append('key', apiKey);
  apiUrl.searchParams.append('url', testUrl);
  apiUrl.searchParams.append('render_js', 'true');
  apiUrl.searchParams.append('country', 'NL');
  apiUrl.searchParams.append('format', 'json');
  apiUrl.searchParams.append('asp', 'true');
  apiUrl.searchParams.append('retry', 'true');
  apiUrl.searchParams.append('proxy_pool', 'public_residential_pool');
  
  try {
    console.log('\nMaking request to ScrapFly...');
    const response = await fetch(apiUrl.toString());
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('ScrapFly error:', response.status);
      console.error('Response:', responseText);
      return;
    }
    
    const result = JSON.parse(responseText);
    console.log('\nScrapFly response received!');
    console.log('Status:', result.result?.status);
    console.log('Content length:', result.result?.content?.length || 0);
    
    if (result.result?.content) {
      // Extract title from HTML
      const titleMatch = result.result.content.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) {
        console.log('Article title:', titleMatch[1]);
      }
      
      // Check if we got the article content
      const hasArticle = result.result.content.includes('article') || result.result.content.includes('content');
      console.log('Contains article content:', hasArticle);
      
      // Show first 500 chars of content
      console.log('\nFirst 500 chars of content:');
      console.log(result.result.content.substring(0, 500));
      
      // Check if it's a redirect or error page
      if (result.result.content.includes('403') || result.result.content.includes('Forbidden')) {
        console.log('\nWARNING: Page might be showing a 403 error');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testScrapFly();