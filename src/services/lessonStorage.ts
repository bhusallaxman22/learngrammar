import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import { openRouterService } from './openrouter.ts';
import type { GrammarCategory, Exercise } from '../types/index.ts';

interface StoredAILesson {
  id: string;
  title: string;
  description: string;
  category: GrammarCategory;
  level: number;
  difficulty: 'easy' | 'medium' | 'hard';
  exercises: Exercise[];
  xpReward: number;
  coinReward: number;
  requiredLevel: number;
  generatedAt: string;
  topic: string;
}

interface UserLessonStorage {
  aiGeneratedLessons: StoredAILesson[];
  lastGenerated: string;
}

export const lessonStorageService = {
  /**
   * Generate AI lessons for a user based on their assessment level and weaknesses
   */
  async generatePersonalizedLessons(
    userId: string,
    assessmentLevel: 'beginner' | 'intermediate' | 'advanced',
    weaknesses: string[] = []
  ): Promise<StoredAILesson[]> {
    console.log('🎓 Generating personalized lessons for', { userId, assessmentLevel, weaknesses });

    const lessons: StoredAILesson[] = [];
    const difficulty = assessmentLevel === 'beginner' ? 'easy' : assessmentLevel === 'intermediate' ? 'medium' : 'hard';
    
    // Determine categories to focus on (prioritize weaknesses)
    const categoriesToGenerate: GrammarCategory[] = [];
    
    // Add weakness categories first
    if (weaknesses.length > 0) {
      weaknesses.forEach(weakness => {
        const category = this.mapWeaknessToCategory(weakness);
        if (category && !categoriesToGenerate.includes(category)) {
          categoriesToGenerate.push(category);
        }
      });
    }
    
    // Add some variety with other categories
    const allCategories: GrammarCategory[] = [
      'subject-verb-object',
      'tenses',
      'subject-verb-agreement',
      'conditionals',
      'parts-of-speech',
      'punctuation',
      'sentence-structure'
    ];
    
    // Fill up to 5 categories total
    allCategories.forEach(cat => {
      if (categoriesToGenerate.length < 5 && !categoriesToGenerate.includes(cat)) {
        categoriesToGenerate.push(cat);
      }
    });

    // Generate 2 lessons per category (10 total lessons)
    let lessonCounter = 1;
    for (const category of categoriesToGenerate.slice(0, 5)) {
      for (let i = 0; i < 2; i++) {
        try {
          const topic = this.generateTopicForCategory(category, assessmentLevel, i + 1);
          const exerciseType = this.selectExerciseType(i);
          
          console.log(`Generating lesson ${lessonCounter}: ${category} - ${topic}`);
          
          const exercises = await openRouterService.generateQuestions({
            category,
            topic,
            difficulty,
            count: 5,
            exerciseType
          });

          const lesson: StoredAILesson = {
            id: `ai-${userId}-${Date.now()}-${lessonCounter}`,
            title: topic,
            description: `AI-generated ${assessmentLevel} lesson on ${topic.toLowerCase()}`,
            category,
            level: assessmentLevel === 'beginner' ? 1 : assessmentLevel === 'intermediate' ? 2 : 3,
            difficulty,
            exercises,
            xpReward: difficulty === 'easy' ? 50 : difficulty === 'medium' ? 75 : 100,
            coinReward: difficulty === 'easy' ? 25 : difficulty === 'medium' ? 40 : 60,
            requiredLevel: 1, // AI lessons always available
            generatedAt: new Date().toISOString(),
            topic
          };

          lessons.push(lesson);
          lessonCounter++;
        } catch (error) {
          console.error(`Error generating lesson for ${category}:`, error);
        }
      }
    }

    // Save to Firebase
    await this.saveLessonsToFirebase(userId, lessons);
    
    console.log(`✅ Generated ${lessons.length} personalized lessons`);
    return lessons;
  },

  /**
   * Get stored AI lessons for a user
   */
  async getUserAILessons(userId: string): Promise<StoredAILesson[]> {
    try {
      const userLessonsDoc = await getDoc(doc(db, 'userLessons', userId));
      
      if (userLessonsDoc.exists()) {
        const data = userLessonsDoc.data() as UserLessonStorage;
        return data.aiGeneratedLessons || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user AI lessons:', error);
      return [];
    }
  },

  /**
   * Clean object by removing undefined values (Firebase doesn't accept undefined)
   */
  cleanObject(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item)).filter(item => item !== undefined);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {};
      Object.keys(obj as Record<string, unknown>).forEach(key => {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined) {
          cleaned[key] = this.cleanObject(value);
        }
      });
      return cleaned;
    }
    
    return obj;
  },

  /**
   * Save generated lessons to Firebase
   */
  async saveLessonsToFirebase(userId: string, lessons: StoredAILesson[]): Promise<void> {
    try {
      // Clean lessons to remove any undefined values
      const cleanedLessons = lessons.map(lesson => this.cleanObject(lesson));
      
      const userLessonsRef = doc(db, 'userLessons', userId);
      const existingDoc = await getDoc(userLessonsRef);
      
      if (existingDoc.exists()) {
        const existingData = existingDoc.data() as UserLessonStorage;
        // Append new lessons to existing ones
        await updateDoc(userLessonsRef, {
          aiGeneratedLessons: [...(existingData.aiGeneratedLessons || []), ...cleanedLessons],
          lastGenerated: new Date().toISOString()
        });
      } else {
        // Create new document
        await setDoc(userLessonsRef, {
          aiGeneratedLessons: cleanedLessons,
          lastGenerated: new Date().toISOString()
        });
      }
      
      console.log('✅ Lessons saved to Firebase');
    } catch (error) {
      console.error('Error saving lessons to Firebase:', error);
      throw error;
    }
  },

  /**
   * Check if user needs new lessons generated
   */
  async shouldGenerateLessons(userId: string): Promise<boolean> {
    try {
      const userLessonsDoc = await getDoc(doc(db, 'userLessons', userId));
      
      if (!userLessonsDoc.exists()) {
        return true; // No lessons yet
      }
      
      const data = userLessonsDoc.data() as UserLessonStorage;
      const lessons = data.aiGeneratedLessons || [];
      
      // Generate if no lessons or all completed
      return lessons.length === 0;
    } catch (error) {
      console.error('Error checking lesson generation status:', error);
      return false;
    }
  },

  /**
   * Map weakness string to GrammarCategory
   */
  mapWeaknessToCategory(weakness: string): GrammarCategory | null {
    const lowerWeakness = weakness.toLowerCase();
    
    if (lowerWeakness.includes('subject') || lowerWeakness.includes('verb') || lowerWeakness.includes('object')) {
      return 'subject-verb-object';
    }
    if (lowerWeakness.includes('tense')) {
      return 'tenses';
    }
    if (lowerWeakness.includes('agreement')) {
      return 'subject-verb-agreement';
    }
    if (lowerWeakness.includes('conditional')) {
      return 'conditionals';
    }
    if (lowerWeakness.includes('parts') || lowerWeakness.includes('speech')) {
      return 'parts-of-speech';
    }
    if (lowerWeakness.includes('punctuation')) {
      return 'punctuation';
    }
    if (lowerWeakness.includes('sentence') || lowerWeakness.includes('structure')) {
      return 'sentence-structure';
    }
    
    return null;
  },

  /**
   * Generate appropriate topic for category and level
   */
  generateTopicForCategory(
    category: GrammarCategory,
    level: 'beginner' | 'intermediate' | 'advanced',
    lessonNumber: number
  ): string {
    const topics: Record<GrammarCategory, Record<string, string[]>> = {
      'subject-verb-object': {
        beginner: ['Identifying Subjects', 'Identifying Verbs'],
        intermediate: ['Direct vs Indirect Objects', 'Complex Subjects'],
        advanced: ['Compound Subjects and Objects', 'Implicit Subjects']
      },
      'tenses': {
        beginner: ['Simple Present Tense', 'Simple Past Tense'],
        intermediate: ['Present Perfect Tense', 'Past Continuous Tense'],
        advanced: ['Past Perfect Continuous', 'Future Perfect Tense']
      },
      'subject-verb-agreement': {
        beginner: ['Singular and Plural Agreement', 'Basic Agreement Rules'],
        intermediate: ['Agreement with Collective Nouns', 'Indefinite Pronouns'],
        advanced: ['Neither...Nor Constructions', 'Subject-Verb Inversion']
      },
      'conditionals': {
        beginner: ['Zero Conditional', 'First Conditional'],
        intermediate: ['Second Conditional', 'Mixed Conditionals'],
        advanced: ['Third Conditional', 'Advanced Conditional Structures']
      },
      'parts-of-speech': {
        beginner: ['Nouns and Pronouns', 'Verbs and Adjectives'],
        intermediate: ['Adverbs and Prepositions', 'Conjunctions'],
        advanced: ['Participles and Gerunds', 'Modal Verbs']
      },
      'punctuation': {
        beginner: ['Periods and Commas', 'Question Marks'],
        intermediate: ['Semicolons and Colons', 'Quotation Marks'],
        advanced: ['Dashes and Parentheses', 'Advanced Punctuation']
      },
      'sentence-structure': {
        beginner: ['Simple Sentences', 'Compound Sentences'],
        intermediate: ['Complex Sentences', 'Sentence Fragments'],
        advanced: ['Compound-Complex Sentences', 'Parallel Structure']
      }
    };

    const categoryTopics = topics[category][level];
    return categoryTopics[(lessonNumber - 1) % categoryTopics.length];
  },

  /**
   * Select exercise type based on lesson number for variety
   */
  selectExerciseType(lessonNumber: number): 'multiple-choice' | 'identify-parts' | 'fill-blank' | 'true-false' {
    const types: Array<'multiple-choice' | 'identify-parts' | 'fill-blank' | 'true-false'> = [
      'multiple-choice',
      'identify-parts',
      'fill-blank',
      'true-false'
    ];
    return types[lessonNumber % types.length];
  },

  /**
   * Clear all AI lessons for a user (useful for regeneration)
   */
  async clearUserAILessons(userId: string): Promise<void> {
    try {
      const userLessonsRef = doc(db, 'userLessons', userId);
      await setDoc(userLessonsRef, {
        aiGeneratedLessons: [],
        lastGenerated: new Date().toISOString()
      });
      console.log('✅ Cleared AI lessons for user');
    } catch (error) {
      console.error('Error clearing AI lessons:', error);
      throw error;
    }
  }
};
