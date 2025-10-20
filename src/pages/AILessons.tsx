import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, BookOpen, Target, Zap, Info, TrendingUp, Brain } from 'lucide-react';
import { openRouterService } from '../services/openrouter.ts';
import AIQuizPlayer from '../components/AIQuizPlayer.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import type { GrammarCategory, Exercise } from '../types/index.ts';
import { useNavigate } from 'react-router-dom';

const AILessons: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<GrammarCategory>('subject-verb-object');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [exerciseType, setExerciseType] = useState<'multiple-choice' | 'identify-parts' | 'fill-blank' | 'true-false'>('multiple-choice');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState('');
  const [showApiInfo, setShowApiInfo] = useState(false);
  const [quizMode, setQuizMode] = useState(false);

  // Load user's assessment level
  useEffect(() => {
    const loadUserLevel = async () => {
      if (!userData?.id) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', userData.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.assessmentLevel) {
            setUserLevel(data.assessmentLevel);
            setAssessmentData(data.lastAssessment);
            
            // Set default difficulty based on level
            if (data.assessmentLevel === 'beginner') {
              setDifficulty('easy');
            } else if (data.assessmentLevel === 'intermediate') {
              setDifficulty('medium');
            } else {
              setDifficulty('hard');
            }
          }
        }
      } catch (error) {
        console.error('Error loading user level:', error);
      }
    };

    loadUserLevel();
  }, [userData]);

  const categories: { value: GrammarCategory; label: string }[] = [
    { value: 'subject-verb-object', label: 'Subject-Verb-Object' },
    { value: 'tenses', label: 'Tenses' },
    { value: 'subject-verb-agreement', label: 'Subject-Verb Agreement' },
    { value: 'conditionals', label: 'Conditionals' },
    { value: 'parts-of-speech', label: 'Parts of Speech' },
    { value: 'punctuation', label: 'Punctuation' },
    { value: 'sentence-structure', label: 'Sentence Structure' },
  ];

  const exerciseTypes = [
    { value: 'multiple-choice', label: '📝 Multiple Choice', description: 'Select the correct answer from options' },
    { value: 'identify-parts', label: '🎯 Identify Parts', description: 'Click words to tag subject/verb/object' },
    { value: 'fill-blank', label: '✏️ Fill in the Blank', description: 'Complete the sentence' },
    { value: 'true-false', label: '✓✗ True/False', description: 'Determine if statement is correct' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setExercises([]);

    try {
      const generatedExercises = await openRouterService.generateQuestions({
        category,
        topic: topic.trim(),
        difficulty,
        count: questionCount,
        exerciseType,
      });

      setExercises(generatedExercises);
      setQuizMode(true); // Start quiz mode automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
      
      if (errorMessage.includes('API key')) {
        setShowApiInfo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGenerator = () => {
    setQuizMode(false);
    setExercises([]);
  };

  const handleQuizComplete = () => {
    setQuizMode(false);
    setExercises([]);
  };

  // If in quiz mode, show the quiz player
  if (quizMode && exercises.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AIQuizPlayer
              exercises={exercises}
              onComplete={handleQuizComplete}
              onBack={handleBackToGenerator}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-accent-500" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Lessons</h1>
          </div>
          <p className="text-lg text-gray-600">
            {userLevel ? `Personalized for your ${userLevel} level` : 'Generate custom grammar exercises using AI'}
          </p>
        </motion.div>

        {/* Level Badge & Assessment Info */}
        {userLevel && assessmentData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-4xl mx-auto mb-8 rounded-xl p-6 ${
              userLevel === 'beginner' ? 'bg-green-50 border-2 border-green-200' :
              userLevel === 'intermediate' ? 'bg-blue-50 border-2 border-blue-200' :
              'bg-purple-50 border-2 border-purple-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  userLevel === 'beginner' ? 'bg-green-500' :
                  userLevel === 'intermediate' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${
                    userLevel === 'beginner' ? 'text-green-900' :
                    userLevel === 'intermediate' ? 'text-blue-900' :
                    'text-purple-900'
                  }`}>
                    Your Level: {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    userLevel === 'beginner' ? 'text-green-700' :
                    userLevel === 'intermediate' ? 'text-blue-700' :
                    'text-purple-700'
                  }`}>
                    Last assessment: {assessmentData.score}% • {assessmentData.strengths?.length || 0} strengths identified
                  </p>
                  {assessmentData.weaknesses && assessmentData.weaknesses.length > 0 && (
                    <p className={`text-sm ${
                      userLevel === 'beginner' ? 'text-green-600' :
                      userLevel === 'intermediate' ? 'text-blue-600' :
                      'text-purple-600'
                    }`}>
                      Focus areas: {assessmentData.weaknesses.join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/assessment')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
                  userLevel === 'beginner' ? 'bg-green-500 hover:bg-green-600 text-white' :
                  userLevel === 'intermediate' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                  'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Retake Assessment
              </button>
            </div>
          </motion.div>
        )}

        {/* No Assessment Warning */}
        {!userLevel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6"
          >
            <div className="flex items-start gap-3">
              <Brain className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Take a Level Assessment
                </h3>
                <p className="text-yellow-800 text-sm mb-4">
                  Complete a quick assessment to get personalized lesson recommendations based on your current level!
                </p>
                <button
                  onClick={() => navigate('/assessment')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              Configure Your Lesson
            </h2>

            {/* Topic Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Present Perfect Tense, Passive Voice, etc."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GrammarCategory)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exercise Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {exerciseTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setExerciseType(type.value as typeof exerciseType)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      exerciseType === type.value
                        ? 'bg-primary-100 border-primary-500'
                        : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Difficulty
              </label>
              <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-3 rounded-xl font-semibold capitalize transition-all border-2 ${
                      difficulty === level
                        ? level === 'easy'
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : level === 'medium'
                          ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                          : 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Questions: {questionCount}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3</span>
                <span>10</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  Generate Questions
                </>
              )}
            </button>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-red-50 border-2 border-red-500 rounded-xl p-4"
              >
                <p className="text-red-800 font-medium">{error}</p>
                {showApiInfo && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-red-700 mb-2">To use AI features:</p>
                    <ol className="text-sm text-red-700 list-decimal list-inside space-y-1">
                      <li>Get an API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-semibold">openrouter.ai</a></li>
                      <li>Add it to your <code className="bg-red-100 px-1 rounded">.env</code> file as <code className="bg-red-100 px-1 rounded">VITE_OPENROUTER_API_KEY</code></li>
                      <li>Restart the dev server</li>
                    </ol>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Status Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent-600" />
              Quiz Status
            </h2>

            {!loading && exercises.length === 0 && (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Ready to generate your quiz!</p>
                <p className="text-sm text-gray-400">Configure settings and click generate</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600 font-medium mb-2">AI is generating your quiz...</p>
                <p className="text-sm text-gray-500">This usually takes 3-5 seconds</p>
              </div>
            )}

            {!loading && exercises.length > 0 && !quizMode && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">
                    Quiz Ready!
                  </h3>
                  <p className="text-green-700 mb-6">
                    {exercises.length} questions generated successfully
                  </p>
                  <button
                    onClick={() => setQuizMode(true)}
                    className="btn-primary px-8 py-3"
                  >
                    Start Interactive Quiz →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Interactive AI Quiz Mode</h3>
              <p className="text-blue-800 text-sm">
                Questions are generated using AI and presented as an interactive quiz. Answer each question,
                get instant feedback, and see your score at the end! Mix different question types for a
                comprehensive learning experience.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AILessons;
