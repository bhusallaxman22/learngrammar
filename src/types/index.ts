// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastActiveDate: string;
  createdAt: string;
  achievements: string[];
  completedLessons: string[];
  badges: Badge[];
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'lessons' | 'accuracy' | 'speed' | 'special';
  reward: {
    xp: number;
    coins: number;
  };
  unlocked: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: string;
}

// Grammar Lesson Types
export interface GrammarLesson {
  id: string;
  title: string;
  category: GrammarCategory;
  level: number;
  description: string;
  content: LessonContent;
  exercises: Exercise[];
  requiredLevel: number;
  xpReward: number;
  coinReward: number;
}

export type GrammarCategory = 
  | 'subject-verb-object'
  | 'tenses'
  | 'subject-verb-agreement'
  | 'conditionals'
  | 'parts-of-speech'
  | 'punctuation'
  | 'sentence-structure';

export interface LessonContent {
  introduction: string;
  rules: Rule[];
  examples: Example[];
  tips: string[];
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  formula?: string;
}

export interface Example {
  sentence: string;
  explanation: string;
  breakdown?: {
    subject?: string;
    verb?: string;
    object?: string;
    other?: { [key: string]: string };
  };
}

// Exercise Types
export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  sentenceParts?: SentencePart[];
}

export type ExerciseType =
  | 'multiple-choice'
  | 'identify-parts'
  | 'fill-blank'
  | 'drag-drop'
  | 'true-false'
  | 'sentence-builder';

export interface SentencePart {
  id: string;
  text: string;
  type: 'subject' | 'verb' | 'object' | 'modifier' | 'other';
  correct?: boolean;
}

// Progress Tracking
export interface UserProgress {
  userId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score: number;
  attempts: number;
  completedAt?: string;
  timeSpent: number; // in seconds
}

// Level System
export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}

// Tense Types
export type Tense =
  | 'simple-present'
  | 'simple-past'
  | 'simple-future'
  | 'present-continuous'
  | 'past-continuous'
  | 'future-continuous'
  | 'present-perfect'
  | 'past-perfect'
  | 'future-perfect'
  | 'present-perfect-continuous'
  | 'past-perfect-continuous'
  | 'future-perfect-continuous';

export interface TenseLesson extends GrammarLesson {
  tense: Tense;
  usageScenarios: string[];
  signalWords: string[];
}

// Conditional Types
export type ConditionalType = 'zero' | 'first' | 'second' | 'third' | 'mixed';

export interface ConditionalLesson extends GrammarLesson {
  conditionalType: ConditionalType;
  structure: {
    ifClause: string;
    mainClause: string;
  };
}
