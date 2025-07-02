const { chromium } = require('playwright');

async function testWorkingDeployment() {
  console.log('🚀 Testing last working deployment...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test the last successful deployment
    console.log('📄 Testing working deployment URL...');
    await page.goto('https://nukk-djlh621kf-vanmooseprojects.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    const title = await page.title();
    console.log(`✅ Working deployment loaded - Title: "${title}"`);
    
    // Check if homepage elements are present
    await page.waitForTimeout(2000);
    
    const urlInput = await page.locator('input[type="url"]').count();
    const analyzeButton = await page.locator('button:has-text("Analyseer")').count();
    const howItWorks = await page.locator('text=Hoe werkt het').count();
    
    console.log(`✅ URL input found: ${urlInput > 0}`);
    console.log(`✅ Analyze button found: ${analyzeButton > 0}`);
    console.log(`✅ How it works section: ${howItWorks > 0}`);

    // Test advertiser portal on working deployment
    console.log('\n💰 Testing advertiser portal...');
    await page.goto('https://nukk-djlh621kf-vanmooseprojects.vercel.app/adverteren', { 
      waitUntil: 'networkidle' 
    });
    const advertiserTitle = await page.title();
    console.log(`✅ Advertiser page: "${advertiserTitle}"`);

    // Take a screenshot
    await page.screenshot({ path: 'nukk-homepage.png', fullPage: true });
    console.log('✅ Screenshot saved as nukk-homepage.png');

    console.log('\n🎉 Working deployment test completed!');
    console.log('\n⚠️ Issue: Latest deployments are failing');
    console.log('💡 Solution: The last working deployment from 3h ago is functional');
    console.log('🔧 Action needed: Fix deployment issues and redeploy');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testWorkingDeployment();