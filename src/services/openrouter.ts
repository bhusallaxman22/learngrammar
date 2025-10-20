import type { Exercise, GrammarCategory } from '../types/index.ts';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateQuestionsParams {
  category: GrammarCategory;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  exerciseType: 'multiple-choice' | 'identify-parts' | 'fill-blank' | 'true-false';
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Add VITE_OPENROUTER_API_KEY to .env file');
    }
  }

  async generateQuestions(params: GenerateQuestionsParams): Promise<Exercise[]> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required. Add VITE_OPENROUTER_API_KEY to your .env file and restart the dev server.');
    }

    // Validate API key format
    if (!this.apiKey.startsWith('sk-or-v1-')) {
      throw new Error('Invalid API key format. OpenRouter keys should start with "sk-or-v1-". Please check your .env file.');
    }

    const systemPrompt = this.buildSystemPrompt(params);
    const userPrompt = this.buildUserPrompt(params);

    console.log('🤖 Generating questions with OpenRouter...');
    console.log('   Model: cognitivecomputations/dolphin-mistral-24b-venice-edition:free');
    console.log('   Topic:', params.topic);
    console.log('   Count:', params.count);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Grammar Learning App',
        },
        body: JSON.stringify({
          model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', // free and high-quality model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ] as OpenRouterMessage[],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || response.statusText;
        
        console.error('❌ OpenRouter API Error:', errorMessage);
        
        // Provide helpful error messages
        if (errorMessage.includes('No auth credentials') || errorMessage.includes('Invalid API key')) {
          throw new Error('Invalid API key. Please:\n1. Get a new key from https://openrouter.ai/keys\n2. Update VITE_OPENROUTER_API_KEY in .env\n3. Restart dev server');
        }
        
        if (errorMessage.includes('insufficient credits') || errorMessage.includes('quota')) {
          throw new Error('Insufficient OpenRouter credits. Add credits at https://openrouter.ai/credits');
        }
        
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenRouter');
      }

      console.log('✅ Questions generated successfully!');
      return this.parseExercises(content, params);
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  private buildSystemPrompt(params: GenerateQuestionsParams): string {
    return `You are an expert English grammar teacher creating educational exercises for students.
Your task is to generate ${params.count} ${params.difficulty} difficulty ${params.exerciseType} exercises about ${params.topic} in the ${params.category} category.

CRITICAL: Respond ONLY with valid JSON. No explanations, no markdown, just raw JSON.

Follow this exact JSON schema:
{
  "exercises": [
    {
      "question": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for multiple-choice
      "correctAnswer": "correct answer or option text",
      "explanation": "Clear explanation of why this is correct",
      "sentenceParts": [ // Only for identify-parts type
        {"id": "word-1", "text": "The", "type": "modifier", "correct": false},
        {"id": "word-2", "text": "cat", "type": "subject", "correct": true},
        {"id": "word-3", "text": "chased", "type": "verb", "correct": true},
        {"id": "word-4", "text": "the", "type": "modifier", "correct": false},
        {"id": "word-5", "text": "mouse", "type": "object", "correct": true}
      ]
    }
  ]
}

For identify-parts exercises:
- Break sentence into individual words/phrases
- Mark only subject, verb, and object as correct: true
- Use type: "subject" | "verb" | "object" | "modifier" | "other"
- Each word needs unique id like "word-1", "word-2", etc.

For multiple-choice:
- Provide exactly 4 options
- Make distractors plausible but clearly wrong
- correctAnswer must match one option exactly

For fill-blank:
- Use _____ in the question for the blank
- correctAnswer is the word(s) that fill the blank

For true-false:
- Make statements that test understanding
- correctAnswer must be "true" or "false"`;
  }

  private buildUserPrompt(params: GenerateQuestionsParams): string {
    const examples = this.getExamplesByType(params.exerciseType);
    
    return `Generate ${params.count} ${params.difficulty} difficulty ${params.exerciseType} exercises about "${params.topic}".

Focus on:
- ${params.category} concepts
- ${params.difficulty} difficulty level
- Interactive and engaging questions
- Clear, educational explanations

${examples}

Return ONLY the JSON object. No markdown formatting, no \`\`\`json blocks, just pure JSON.`;
  }

  private getExamplesByType(type: string): string {
    const examples: Record<string, string> = {
      'multiple-choice': `Example for multiple-choice:
- Question about identifying parts of speech
- 4 options with one clearly correct answer
- Explanation that teaches the concept`,
      
      'identify-parts': `Example for identify-parts:
- Sentence: "The quick brown fox jumps over the lazy dog"
- Break into: ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog"]
- Mark subject="fox", verb="jumps", object="dog" as correct:true
- Others are modifiers or prepositions with correct:false`,
      
      'fill-blank': `Example for fill-blank:
- Question: "She _____ to school every day."
- correctAnswer: "walks" or "goes"
- Test understanding of present tense`,
      
      'true-false': `Example for true-false:
- Statement about grammar rule
- Must be definitively true or false
- Not ambiguous or opinion-based`,
    };

    return examples[type] || '';
  }

  private parseExercises(content: string, params: GenerateQuestionsParams): Exercise[] {
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);
      const exercises = parsed.exercises || parsed;

      if (!Array.isArray(exercises)) {
        throw new Error('Expected exercises array in response');
      }

      return exercises.map((ex: Record<string, unknown>, index: number) => ({
        id: `ai-${params.category}-${Date.now()}-${index}`,
        type: params.exerciseType,
        question: String(ex.question || ''),
        options: (ex.options as string[] | undefined) || undefined,
        correctAnswer: (ex.correctAnswer as string | string[]) || '',
        explanation: String(ex.explanation || ''),
        difficulty: params.difficulty,
        points: params.difficulty === 'easy' ? 10 : params.difficulty === 'medium' ? 15 : 20,
        sentenceParts: (ex.sentenceParts as Exercise['sentenceParts']) || undefined,
      }));
    } catch (error) {
      console.error('Failed to parse OpenRouter response:', error);
      console.error('Raw content:', content);
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  async generateLesson(category: GrammarCategory, topic: string, level: number): Promise<{
    introduction: string;
    rules: Array<{ id: string; title: string; description: string; formula?: string }>;
    examples: Array<{ sentence: string; explanation: string; breakdown?: Record<string, string> }>;
  }> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const systemPrompt = `You are an expert English grammar teacher creating lesson content.
Generate comprehensive lesson content about "${topic}" for ${category} category.

Return ONLY valid JSON with this exact structure:
{
  "introduction": "Brief introduction to the topic",
  "rules": [
    {
      "title": "Rule name",
      "description": "Clear explanation",
      "formula": "Pattern or formula (optional)"
    }
  ],
  "examples": [
    {
      "sentence": "Example sentence",
      "explanation": "Why this example demonstrates the concept",
      "breakdown": {
        "subject": "subject text",
        "verb": "verb text",
        "object": "object text"
      }
    }
  ]
}

No markdown, no code blocks, just raw JSON.`;

    const userPrompt = `Create lesson content for "${topic}" at level ${level}. Include 3-4 rules and 3-4 examples.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Grammar Learning App',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ] as OpenRouterMessage[],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      let cleanContent = content.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(cleanContent);
      
      // Add IDs to rules
      if (parsed.rules) {
        parsed.rules = parsed.rules.map((rule: Record<string, unknown>, index: number) => ({
          ...rule,
          id: `rule-${Date.now()}-${index}`,
        }));
      }

      return parsed;
    } catch (error) {
      console.error('Error generating lesson:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const openRouterService = new OpenRouterService();
