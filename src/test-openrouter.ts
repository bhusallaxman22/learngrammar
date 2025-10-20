import { openRouterService } from './services/openrouter.ts';

// Debug script to test OpenRouter connection
async function testOpenRouter() {
  console.log('=== OpenRouter Connection Test ===\n');
  
  // Check if API key is loaded
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  console.log('1. API Key Check:');
  console.log('   - Exists:', !!apiKey);
  console.log('   - Length:', apiKey?.length || 0);
  console.log('   - Starts with:', apiKey?.substring(0, 10) + '...');
  console.log('   - Has whitespace:', apiKey !== apiKey?.trim());
  console.log('');

  // Try to generate a simple question
  console.log('2. Attempting to generate questions...');
  try {
    const exercises = await openRouterService.generateQuestions({
      category: 'subject-verb-object',
      topic: 'Basic sentence structure',
      difficulty: 'easy',
      count: 1,
      exerciseType: 'multiple-choice',
    });
    
    console.log('   ✅ SUCCESS! Generated', exercises.length, 'exercise(s)');
    console.log('   First question:', exercises[0]?.question.substring(0, 50) + '...');
  } catch (error) {
    console.log('   ❌ ERROR:', error instanceof Error ? error.message : String(error));
    
    // Additional debugging
    if (error instanceof Error && error.message.includes('No auth credentials')) {
      console.log('\n3. Troubleshooting:');
      console.log('   - Check that your API key starts with "sk-or-v1-" (not "ysk-")');
      console.log('   - Verify the key at https://openrouter.ai/keys');
      console.log('   - Make sure there are no extra spaces in .env file');
      console.log('   - Try regenerating a new API key if needed');
    }
  }
}

// Uncomment to run test
// testOpenRouter();

export { testOpenRouter };
