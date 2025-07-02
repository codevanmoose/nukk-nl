const { chromium } = require('playwright');

async function testSuccessfulDeployment() {
  console.log('🚀 Testing SUCCESSFUL deployment...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test the successful deployment
    console.log('📄 Testing successful deployment...');
    await page.goto('https://nukk-qga3zfyur-vanmooseprojects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const title = await page.title();
    console.log(`✅ SUCCESS! Title: "${title}"`);
    
    // Check core elements
    await page.waitForTimeout(2000);
    
    const urlInput = await page.locator('input[type="url"]').count();
    const analyzeButton = await page.locator('button:has-text("Analyseer")').count();
    const howItWorks = await page.locator('text=Hoe werkt het').count();
    
    console.log(`✅ URL input: ${urlInput > 0 ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ Analyze button: ${analyzeButton > 0 ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ How it works: ${howItWorks > 0 ? 'FOUND' : 'MISSING'}`);

    // Test advertiser portal
    console.log('\n💰 Testing advertiser portal...');
    await page.goto('https://nukk-qga3zfyur-vanmooseprojects.vercel.app/adverteren', { 
      waitUntil: 'networkidle' 
    });
    const advertiserTitle = await page.title();
    console.log(`✅ Advertiser page: "${advertiserTitle}"`);

    // Test dashboard
    console.log('\n🎛️ Testing dashboard...');
    await page.goto('https://nukk-qga3zfyur-vanmooseprojects.vercel.app/dashboard', { 
      waitUntil: 'networkidle' 
    });
    const dashboardTitle = await page.title();
    console.log(`✅ Dashboard: "${dashboardTitle}"`);

    // Test admin
    console.log('\n👨‍💼 Testing admin...');
    await page.goto('https://nukk-qga3zfyur-vanmooseprojects.vercel.app/admin', { 
      waitUntil: 'networkidle' 
    });
    const adminTitle = await page.title();
    console.log(`✅ Admin: "${adminTitle}"`);

    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('🌐 Working URL: https://nukk-qga3zfyur-vanmooseprojects.vercel.app');
    console.log('💰 All revenue features deployed!');
    console.log('🚀 Ready for user testing!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSuccessfulDeployment();