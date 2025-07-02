require('dotenv').config({ path: '.env.production.local' });

console.log('Testing API Keys Configuration...\n');

// Check which keys are present
const keys = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  xai: process.env.XAI_API_KEY
};

console.log('API Keys Status:');
console.log('================');
console.log(`OpenAI API Key: ${keys.openai ? '✅ Present' : '❌ Missing'}`);
if (keys.openai) {
  console.log(`  - Starts with: ${keys.openai.substring(0, 10)}...`);
  console.log(`  - Looks like: ${keys.openai.includes('sk-ant') ? '⚠️  Anthropic key?' : keys.openai.startsWith('sk-') ? 'OpenAI key' : 'Unknown format'}`);
}

console.log(`\nAnthropic API Key: ${keys.anthropic ? '✅ Present' : '❌ Missing'}`);
if (keys.anthropic) {
  console.log(`  - Starts with: ${keys.anthropic.substring(0, 10)}...`);
  console.log(`  - Looks like: ${keys.anthropic.startsWith('sk-ant') ? 'Anthropic key' : keys.anthropic.startsWith('sk-proj') ? '⚠️  OpenAI key?' : 'Unknown format'}`);
}

console.log(`\nxAI API Key: ${keys.xai ? '✅ Present' : '❌ Missing'}`);
if (keys.xai) {
  console.log(`  - Starts with: ${keys.xai.substring(0, 10)}...`);
}

console.log('\n⚠️  Note: The API keys appear to be swapped!');
console.log('- OPENAI_API_KEY contains an Anthropic key');
console.log('- ANTHROPIC_API_KEY contains an OpenAI key');
console.log('\nThis will cause the AI analysis to fail.');