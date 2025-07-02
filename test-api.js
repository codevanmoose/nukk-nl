async function testAnalyzeAPI() {
  console.log('🧪 Testing analyze API...\n');
  
  const testUrl = 'https://www.nu.nl/politiek/6361052/asielwetten-lijken-te-stranden-in-eerste-kamer-cda-stemt-tegen.html';
  
  try {
    // Test on production
    console.log('📡 Testing on production API...');
    const response = await fetch('https://www.nukk.nl/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ API working!');
      console.log('📊 Analysis score:', data.analysis?.objectivityScore);
    } else {
      console.log('❌ API error:', data.error || data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
  
  // Test on working Vercel URL as fallback
  console.log('\n📡 Testing on Vercel URL...');
  try {
    const response2 = await fetch('https://nukk-nl-vanmooseprojects.vercel.app/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl })
    });
    
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2).substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testAnalyzeAPI();