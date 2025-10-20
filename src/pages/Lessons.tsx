import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { motion } from 'framer-motion';
import { BookOpen, Lock, Check, Star, Sparkles, Loader2, Brain } from 'lucide-react';
import { allLessons } from '../data/lessons.ts';
import { Link, useNavigate } from 'react-router-dom';
import type { GrammarCategory } from '../types/index.ts';
import { lessonStorageService } from '../services/lessonStorage.ts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config.ts';

const categoryInfo: Record<
  GrammarCategory,
  { title: string; description: string; color: string; icon: string }
> = {
  'subject-verb-object': {
    title: 'Subject-Verb-Object',
    description: 'Master sentence structure basics',
    color: 'blue',
    icon: '🎯',
  },
  tenses: {
    title: 'Tenses',
    description: 'Learn all English tenses',
    color: 'green',
    icon: '⏰',
  },
  'subject-verb-agreement': {
    title: 'Subject-Verb Agreement',
    description: 'Make subjects and verbs agree',
    color: 'orange',
    icon: '🤝',
  },
  conditionals: {
    title: 'Conditionals',
    description: 'Master if-clauses',
    color: 'purple',
    icon: '🔀',
  },
  'parts-of-speech': {
    title: 'Parts of Speech',
    description: 'Learn word types',
    color: 'pink',
    icon: '📝',
  },
  punctuation: {
    title: 'Punctuation',
    description: 'Master punctuation marks',
    color: 'red',
    icon: '❗',
  },
  'sentence-structure': {
    title: 'Sentence Structure',
    description: 'Build complex sentences',
    color: 'indigo',
    icon: '🏗️',
  },
};

const Lessons: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory | 'all' | 'ai'>('all');
  const [aiLessons, setAILessons] = useState<any[]>([]);
  const [generatingLessons, setGeneratingLessons] = useState(false);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);

  // Load user's AI lessons and assessment level
  useEffect(() => {
    const loadUserData = async () => {
      if (!userData?.id) return;

      try {
        // Load assessment level
        const userDoc = await getDoc(doc(db, 'users', userData.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserLevel(data.assessmentLevel || null);
        }

        // Load AI lessons
        const lessons = await lessonStorageService.getUserAILessons(userData.id);
        setAILessons(lessons);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [userData]);

  // Combine regular and AI lessons for filtering
  const combinedLessons = [...allLessons, ...aiLessons];
  
  const filteredLessons =
    selectedCategory === 'all'
      ? combinedLessons
      : selectedCategory === 'ai'
      ? aiLessons
      : combinedLessons.filter(lesson => lesson.category === selectedCategory);

  const categories = Object.keys(categoryInfo) as GrammarCategory[];

  const isLessonUnlocked = (lesson: typeof allLessons[0]) => {
    return userData ? userData.level >= lesson.requiredLevel : false;
  };

  const isLessonCompleted = (lessonId: string) => {
    return userData?.completedLessons.includes(lessonId) || false;
  };

  const handleGenerateLessons = async () => {
    if (!userData?.id || !userLevel) {
      navigate('/assessment');
      return;
    }

    setGeneratingLessons(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', userData.id));
      const assessmentData = userDoc.exists() ? userDoc.data().lastAssessment : null;
      const weaknesses = assessmentData?.weaknesses || [];

      const generatedLessons = await lessonStorageService.generatePersonalizedLessons(
        userData.id,
        userLevel,
        weaknesses
      );

      setAILessons(generatedLessons);
      setSelectedCategory('ai');
    } catch (error) {
      console.error('Error generating lessons:', error);
      alert('Failed to generate lessons. Please check your OpenRouter API key.');
    } finally {
      setGeneratingLessons(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Grammar Lessons</h1>
            <p className="text-gray-600">
              {aiLessons.length > 0 
                ? `${allLessons.length} pre-built + ${aiLessons.length} AI-generated lessons` 
                : 'Choose a lesson to start learning'}
            </p>
          </div>
          
          {userLevel && (
            <button
              onClick={handleGenerateLessons}
              disabled={generatingLessons}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {generatingLessons ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Lessons
                </>
              )}
            </button>
          )}
        </div>

        {/* Assessment Prompt */}
        {!userLevel && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-1">
                  Get Personalized AI Lessons!
                </h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Complete a level assessment to unlock AI-generated lessons tailored to your proficiency level and weak areas.
                </p>
                <button
                  onClick={() => navigate('/assessment')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Lessons ({allLessons.length + aiLessons.length})
          </button>
          
          {aiLessons.length > 0 && (
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === 'ai'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-purple-300'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>AI Lessons</span>
              <span className="text-xs opacity-75">({aiLessons.length})</span>
            </button>
          )}
          
          {categories.map(category => {
            const info = categoryInfo[category];
            const lessonCount = combinedLessons.filter(l => l.category === category).length;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.title}</span>
                <span className="text-xs opacity-75">({lessonCount})</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Lessons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, index) => {
          const unlocked = isLessonUnlocked(lesson);
          const completed = isLessonCompleted(lesson.id);
          const isAILesson = lesson.id.startsWith('ai-');
          const categoryColor = categoryInfo[lesson.category as GrammarCategory]?.color || 'gray';

          return (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={unlocked ? `/lesson/${lesson.id}` : '#'}
                className={`card block h-full ${
                  !unlocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl'
                }`}
                onClick={e => !unlocked && e.preventDefault()}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <div
                      className={`badge bg-${categoryColor}-100 text-${categoryColor}-700`}
                    >
                      Level {lesson.level}
                    </div>
                    {isAILesson && (
                      <div className="badge bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </div>
                    )}
                  </div>
                  {completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                  {!unlocked && <Lock className="w-5 h-5 text-gray-400" />}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{lesson.xpReward} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <span>💰</span>
                    <span>{lesson.coinReward} Coins</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <BookOpen className="w-4 h-4" />
                  <span>{lesson.exercises.length} exercises</span>
                </div>

                {!unlocked && (
                  <div className="mt-3 text-xs text-gray-500">
                    🔒 Requires Level {lesson.requiredLevel}
                  </div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No lessons found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Lessons;
