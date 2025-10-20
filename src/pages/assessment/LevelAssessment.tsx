import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, CheckCircle, XCircle, ArrowRight, Award, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
}

const assessmentQuestions: AssessmentQuestion[] = [
  // Beginner Level
  {
    id: 'q1',
    category: 'Subject-Verb-Object',
    question: 'In the sentence "The cat chased the mouse," what is the subject?',
    options: ['The cat', 'chased', 'the mouse', 'The cat chased'],
    correctAnswer: 'The cat',
    difficulty: 'beginner',
    explanation: 'The subject is who or what performs the action. "The cat" is doing the chasing.'
  },
  {
    id: 'q2',
    category: 'Tenses',
    question: 'Which sentence uses the simple past tense correctly?',
    options: ['I go to school yesterday', 'I went to school yesterday', 'I going to school yesterday', 'I goes to school yesterday'],
    correctAnswer: 'I went to school yesterday',
    difficulty: 'beginner',
    explanation: 'Simple past uses the past form of the verb (went) to describe completed actions.'
  },
  {
    id: 'q3',
    category: 'Subject-Verb Agreement',
    question: 'Complete: The dogs _____ in the park.',
    options: ['runs', 'run', 'running', 'ran'],
    correctAnswer: 'run',
    difficulty: 'beginner',
    explanation: 'Plural subjects (dogs) take plural verbs (run) in present tense.'
  },
  
  // Intermediate Level
  {
    id: 'q4',
    category: 'Tenses',
    question: 'Which sentence correctly uses the present perfect tense?',
    options: ['I have seen that movie', 'I seen that movie', 'I have saw that movie', 'I am seeing that movie'],
    correctAnswer: 'I have seen that movie',
    difficulty: 'intermediate',
    explanation: 'Present perfect uses have/has + past participle (seen, not saw).'
  },
  {
    id: 'q5',
    category: 'Conditionals',
    question: 'Which is a correct first conditional sentence?',
    options: [
      'If it rains, I will stay home',
      'If it rained, I will stay home',
      'If it will rain, I stay home',
      'If it rain, I will stay home'
    ],
    correctAnswer: 'If it rains, I will stay home',
    difficulty: 'intermediate',
    explanation: 'First conditional: If + present simple, will + base verb. Used for real future possibilities.'
  },
  {
    id: 'q6',
    category: 'Subject-Verb-Object',
    question: 'Identify the object: "She gave her friend a gift."',
    options: ['She', 'gave', 'a gift', 'her friend'],
    correctAnswer: 'a gift',
    difficulty: 'intermediate',
    explanation: 'The direct object receives the action. "A gift" is what was given.'
  },
  
  // Advanced Level
  {
    id: 'q7',
    category: 'Tenses',
    question: 'Which sentence correctly uses the past perfect continuous?',
    options: [
      'I had been studying for three hours when she called',
      'I have been studying for three hours when she called',
      'I was studying for three hours when she called',
      'I had studied for three hours when she called'
    ],
    correctAnswer: 'I had been studying for three hours when she called',
    difficulty: 'advanced',
    explanation: 'Past perfect continuous (had been + -ing) shows an action that was ongoing before another past action.'
  },
  {
    id: 'q8',
    category: 'Conditionals',
    question: 'Which is a correct third conditional sentence?',
    options: [
      'If I had studied, I would have passed',
      'If I studied, I would pass',
      'If I study, I will pass',
      'If I would study, I would have passed'
    ],
    correctAnswer: 'If I had studied, I would have passed',
    difficulty: 'advanced',
    explanation: 'Third conditional: If + past perfect, would have + past participle. Used for unreal past situations.'
  },
  {
    id: 'q9',
    category: 'Subject-Verb Agreement',
    question: 'Complete: Neither the teacher nor the students _____ ready.',
    options: ['is', 'are', 'was', 'be'],
    correctAnswer: 'are',
    difficulty: 'advanced',
    explanation: 'With "neither...nor," the verb agrees with the subject closer to it (students = plural).'
  },
  {
    id: 'q10',
    category: 'Tenses',
    question: 'Which sentence uses the future perfect correctly?',
    options: [
      'By next year, I will have graduated',
      'By next year, I will graduate',
      'By next year, I have graduated',
      'By next year, I am graduating'
    ],
    correctAnswer: 'By next year, I will have graduated',
    difficulty: 'advanced',
    explanation: 'Future perfect (will have + past participle) shows an action that will be completed by a specific future time.'
  }
];

const LevelAssessment: React.FC = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    level: 'beginner' | 'intermediate' | 'advanced';
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } | null>(null);

  const currentQuestion = assessmentQuestions[currentIndex];
  const progress = ((currentIndex + 1) / assessmentQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    const correct = answer === currentQuestion.correctAnswer;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    if (currentIndex < assessmentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const correctAnswers = assessmentQuestions.filter(
      q => answers[q.id] === q.correctAnswer
    );
    const score = Math.round((correctAnswers.length / assessmentQuestions.length) * 100);

    // Analyze by difficulty
    const intermediateCorrect = correctAnswers.filter(q => q.difficulty === 'intermediate').length;
    const advancedCorrect = correctAnswers.filter(q => q.difficulty === 'advanced').length;

    // Determine level
    let level: 'beginner' | 'intermediate' | 'advanced';
    if (score >= 80 && advancedCorrect >= 2) {
      level = 'advanced';
    } else if (score >= 60 && intermediateCorrect >= 2) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    // Analyze by category
    const categoryPerformance: Record<string, { correct: number; total: number }> = {};
    assessmentQuestions.forEach(q => {
      if (!categoryPerformance[q.category]) {
        categoryPerformance[q.category] = { correct: 0, total: 0 };
      }
      categoryPerformance[q.category].total++;
      if (answers[q.id] === q.correctAnswer) {
        categoryPerformance[q.category].correct++;
      }
    });

    const strengths = Object.entries(categoryPerformance)
      .filter(([, perf]) => perf.correct / perf.total >= 0.7)
      .map(([cat]) => cat);

    const weaknesses = Object.entries(categoryPerformance)
      .filter(([, perf]) => perf.correct / perf.total < 0.5)
      .map(([cat]) => cat);

    const recommendations = [
      level === 'beginner' ? 'Start with foundational grammar lessons' : 
      level === 'intermediate' ? 'Focus on complex sentence structures' : 
      'Challenge yourself with advanced grammar concepts',
      weaknesses.length > 0 ? `Practice more: ${weaknesses.join(', ')}` : 'Keep up the excellent work!',
      'Use AI lessons to generate personalized practice'
    ];

    const result = { level, score, strengths, weaknesses, recommendations };
    setAssessmentResult(result);
    setCompleted(true);
    saveAssessment(result);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const saveAssessment = async (result: typeof assessmentResult) => {
    if (!userData?.id || !result) return;

    try {
      const assessmentData = {
        level: result.level,
        score: result.score,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        recommendations: result.recommendations,
        completedAt: new Date().toISOString(),
        answers: answers
      };

      await setDoc(doc(db, 'users', userData.id), {
        assessmentLevel: result.level,
        lastAssessment: assessmentData,
        assessmentCompleted: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('✅ Assessment saved successfully');
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Grammar Level Assessment
              </h1>
              <p className="text-lg text-gray-600">
                Let's discover your current grammar level and create a personalized learning path!
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What to Expect:</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>10 Questions</strong> covering various grammar topics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Adaptive Difficulty</strong> from beginner to advanced
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>Personalized Results</strong> with your level and recommendations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">
                    <strong>AI-Generated Lessons</strong> tailored to your level
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Tip:</strong> Take your time and answer honestly. This helps us create the best learning experience for you!
              </p>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              Start Assessment
              <ArrowRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (completed && assessmentResult) {
    const levelColors = {
      beginner: 'from-green-500 to-emerald-500',
      intermediate: 'from-blue-500 to-cyan-500',
      advanced: 'from-purple-500 to-pink-500'
    };

    const levelLabels = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${levelColors[assessmentResult.level]} rounded-full mb-4`}>
                <Award className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Assessment Complete!
              </h1>
              <p className="text-xl text-gray-600">
                You're at the <span className="font-bold text-purple-600">{levelLabels[assessmentResult.level]}</span> level
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-600 font-semibold mb-1">Your Score</p>
                <p className="text-3xl font-bold text-purple-900">{assessmentResult.score}%</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-semibold mb-1">Strengths</p>
                <p className="text-3xl font-bold text-green-900">{assessmentResult.strengths.length}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-600 font-semibold mb-1">Level</p>
                <p className="text-2xl font-bold text-blue-900">{levelLabels[assessmentResult.level]}</p>
              </div>
            </div>

            {assessmentResult.strengths.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Your Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {assessmentResult.strengths.map(strength => (
                    <span key={strength} className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {assessmentResult.weaknesses.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Areas to Improve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {assessmentResult.weaknesses.map(weakness => (
                    <span key={weakness} className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-medium">
                      {weakness}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Personalized Recommendations
              </h3>
              <ul className="space-y-2">
                {assessmentResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-blue-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/ai-lessons')}
                className="flex-1 bg-white border-2 border-purple-600 text-purple-600 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all"
              >
                Generate Personalized Lessons
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} of {assessmentQuestions.length}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              currentQuestion.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              currentQuestion.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            />
          </div>
        </div>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6">
            <span className="text-sm font-semibold text-purple-600 mb-2 block">
              {currentQuestion.category}
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !showFeedback && handleAnswer(option)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 ${
                  answers[currentQuestion.id] === option
                    ? 'bg-purple-100 border-purple-500 text-purple-800'
                    : 'bg-gray-50 border-gray-200 hover:border-purple-300 text-gray-700'
                } ${
                  showFeedback && option === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : ''
                } ${
                  showFeedback && answers[currentQuestion.id] === option && !isCorrect
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : ''
                }`}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white mr-3 text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl p-6 mb-6 ${
                  isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  )}
                  <div>
                    <h4 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correct! 🎉' : 'Not quite right'}
                    </h4>
                    <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showFeedback && (
            <button
              onClick={handleNext}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            >
              {currentIndex < assessmentQuestions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LevelAssessment;
