async function testAnnotations() {
  console.log('Testing annotation generation...\n');
  
  const testUrl = `https://www.nu.nl/test-${Date.now()}/demo.html`;
  
  try {
    const response = await fetch('https://www.nukk.nl/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error:', data.error);
      return;
    }
    
    console.log('Analysis Results:');
    console.log('- Score:', data.analysis?.objectivity_score);
    console.log('- Model:', data.analysis?.ai_model);
    console.log('- Processing time:', data.analysis?.processing_time_ms, 'ms');
    
    console.log('\nAnnotations:', data.annotations?.length || 0);
    
    if (data.annotations && data.annotations.length > 0) {
      console.log('\nDetailed annotations:');
      data.annotations.forEach((ann, i) => {
        console.log(`\n${i + 1}. ${ann.type || ann.annotation_type}`);
        console.log(`   Text: "${ann.text || 'N/A'}"`);
        console.log(`   Reasoning: ${ann.reasoning || ann.explanation}`);
        console.log(`   Position: [${ann.start_index || ann.text_start}:${ann.end_index || ann.text_end}]`);
        console.log(`   Confidence: ${ann.confidence}`);
      });
    } else {
      console.log('No annotations were generated.');
      
      // Check if this is due to mock mode
      if (data.analysis?.ai_model === 'mock-demo') {
        console.log('\nRunning in mock mode. Annotations should be generated from demo content.');
      }
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testAnnotations();