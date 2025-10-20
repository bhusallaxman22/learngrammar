import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProgress } from '../contexts/ProgressContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { allLessons } from '../data/lessons.ts';
import { lessonStorageService } from '../services/lessonStorage.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Trophy, Coins, Star, Sparkles, Target, Lightbulb, Flame, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const LessonPlayer: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { completeLesson, updateStreak } = useProgress();
  const [lesson, setLesson] = useState(allLessons.find(l => l.id === lessonId));
  
  // Load AI lesson if needed
  useEffect(() => {
    const loadAILesson = async () => {
      if (!lessonId?.startsWith('ai-') || !userData?.id) return;
      
      const aiLessons = await lessonStorageService.getUserAILessons(userData.id);
      const aiLesson = aiLessons.find(l => l.id === lessonId);
      if (aiLesson) {
        setLesson(aiLesson as any);
      }
    };
    
    loadAILesson();
  }, [lessonId, userData]);

  const [currentView, setCurrentView] = useState<'intro' | 'content' | 'exercise' | 'complete'>('intro');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});
  const [draggedWords, setDraggedWords] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lesson not found</h2>
          <button onClick={() => navigate('/lessons')} className="btn-primary">Back to Lessons</button>
        </div>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const totalExercises = lesson.exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;
  const isAILesson = lesson.id.startsWith('ai-');
  const hasContent = lesson.content !== undefined;

  const handleAnswer = () => {
    let correct = false;
    if (currentExercise.type === 'identify-parts') {
      const requiredParts = currentExercise.sentenceParts?.filter(p => p.correct) || [];
      correct = requiredParts.every(part => selectedParts[part.id] === part.type);
    } else if (currentExercise.type === 'drag-drop') {
      const userSentence = draggedWords.join(' ');
      correct = userSentence.toLowerCase().trim() === (currentExercise.correctAnswer as string).toLowerCase().trim();
    } else {
      correct = userAnswer.toLowerCase().trim() === (currentExercise.correctAnswer as string).toLowerCase().trim();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + currentExercise.points);
      setStreak(prev => prev + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setUserAnswer('');
      setSelectedParts({});
      setDraggedWords([]);
      setShowFeedback(false);
      setShowHint(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await completeLesson(lesson.id, score, timeSpent);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setCurrentView('complete');
  };

  const togglePartSelection = (partId: string, partType: string) => {
    setSelectedParts(prev => ({ ...prev, [partId]: prev[partId] === partType ? '' : partType }));
  };

  if (currentView === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto p-6">
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white rounded-full shadow-lg">
                <Target className="w-12 h-12 text-primary-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{lesson.title}</h1>
                <p className="text-gray-600 mt-1">{lesson.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 text-center shadow-md">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">XP Reward</p>
                <p className="text-2xl font-bold text-gray-900">{lesson.xpReward}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-md">
                <Coins className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Coins</p>
                <p className="text-2xl font-bold text-gray-900">{lesson.coinReward}</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-md">
                <Star className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Exercises</p>
                <p className="text-2xl font-bold text-gray-900">{totalExercises}</p>
              </div>
            </div>
            
            {isAILesson && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">AI-Generated Lesson</span>
                </div>
                <p className="text-purple-600 text-sm mt-1">
                  This lesson was personalized for your level
                </p>
              </div>
            )}
            
            <button 
              onClick={() => setCurrentView(hasContent ? 'content' : 'exercise')} 
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              {hasContent ? 'Learn Concepts First' : 'Start Practice'} <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'content' && hasContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent-500" />
              Learn the Concepts
            </h2>
            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6">
                <p className="text-lg text-gray-700 leading-relaxed">{lesson.content?.introduction}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary-600" />
                  Key Rules
                </h3>
                {lesson.content?.rules?.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border-2 border-primary-200 rounded-xl p-6 hover:border-primary-400 transition-all hover:shadow-lg"
                  >
                    <h4 className="font-bold text-xl text-primary-700 mb-2">{rule.title}</h4>
                    <p className="text-gray-700 mb-3">{rule.description}</p>
                    {rule.formula && (
                      <div className="bg-primary-50 rounded-lg p-3 font-mono text-primary-800 border-l-4 border-primary-500">
                        {rule.formula}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  Examples
                </h3>
                {lesson.content?.examples?.map((example, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-accent-50 to-yellow-50 rounded-xl p-6 border-2 border-accent-200 hover:border-accent-400 transition-all"
                  >
                    <p className="text-lg font-medium text-gray-900 mb-3 italic">&quot;{example.sentence}&quot;</p>
                    <p className="text-gray-700 mb-3">{example.explanation}</p>
                    {example.breakdown && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {Object.entries(example.breakdown).map(([key, value]) => (
                          <div key={key} className="bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase">{key}</span>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              {typeof value === 'string' ? value : JSON.stringify(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            <button onClick={() => setCurrentView('exercise')} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
              Start Exercises <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'exercise') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Question {currentExerciseIndex + 1} of {totalExercises}</span>
              <div className="flex items-center gap-4">
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-700">{streak} streak!</span>
                  </div>
                )}
                <span className="text-sm font-medium text-primary-600">{score} points</span>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                currentExercise.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentExercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {currentExercise.difficulty.toUpperCase()} • {currentExercise.points} points
              </span>
              <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                <Lightbulb className="w-5 h-5" />
                {showHint ? 'Hide' : 'Show'} Hint
              </button>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentExercise.question}</h3>
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">{currentExercise.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {currentExercise.type === 'multiple-choice' && (
              <div className="space-y-3 mb-6">
                {currentExercise.options?.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserAnswer(option)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-xl text-left font-medium transition-all border-2 ${
                      userAnswer === option ? 'bg-primary-100 border-primary-500 text-primary-800' : 'bg-gray-50 border-gray-200 hover:border-primary-300 text-gray-700'
                    } ${showFeedback && option === currentExercise.correctAnswer ? 'bg-green-100 border-green-500' : ''} ${
                      showFeedback && userAnswer === option && !isCorrect ? 'bg-red-100 border-red-500' : ''
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white mr-3 text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </motion.button>
                ))}
              </div>
            )}
            {currentExercise.type === 'identify-parts' && currentExercise.sentenceParts && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.sentenceParts.map((part) => (
                      <motion.span
                        key={part.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => togglePartSelection(part.id, part.type)}
                        className={`inline-block px-3 py-2 rounded-lg cursor-pointer transition-all border-2 font-medium ${
                          selectedParts[part.id] === 'subject' ? 'bg-blue-200 border-blue-500 text-blue-900 underline decoration-2' :
                          selectedParts[part.id] === 'verb' ? 'bg-green-200 border-green-500 text-green-900 underline decoration-2' :
                          selectedParts[part.id] === 'object' ? 'bg-purple-200 border-purple-500 text-purple-900 underline decoration-2' :
                          selectedParts[part.id] === 'modifier' ? 'bg-yellow-200 border-yellow-500 text-yellow-900 underline decoration-2' :
                          'bg-white border-gray-300 hover:border-primary-400 hover:shadow-md'
                        }`}
                      >
                        {part.text}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => { const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]); if (unselected) togglePartSelection(unselected.id, 'subject'); }} className="p-3 bg-blue-100 border-2 border-blue-300 rounded-lg text-blue-800 font-semibold hover:bg-blue-200 transition-all">
                    🔵 Subject
                  </button>
                  <button onClick={() => { const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]); if (unselected) togglePartSelection(unselected.id, 'verb'); }} className="p-3 bg-green-100 border-2 border-green-300 rounded-lg text-green-800 font-semibold hover:bg-green-200 transition-all">
                    🟢 Verb
                  </button>
                  <button onClick={() => { const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]); if (unselected) togglePartSelection(unselected.id, 'object'); }} className="p-3 bg-purple-100 border-2 border-purple-300 rounded-lg text-purple-800 font-semibold hover:bg-purple-200 transition-all">
                    🟣 Object
                  </button>
                  <button onClick={() => { const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]); if (unselected) togglePartSelection(unselected.id, 'modifier'); }} className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold hover:bg-yellow-200 transition-all">
                    🟡 Modifier
                  </button>
                </div>
              </div>
            )}
            {currentExercise.type === 'fill-blank' && (
              <div className="mb-6">
                <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={showFeedback} placeholder="Type your answer here..." className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" />
              </div>
            )}
            {currentExercise.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setUserAnswer('true')} disabled={showFeedback} className={`p-6 rounded-xl text-xl font-bold transition-all border-2 ${userAnswer === 'true' ? 'bg-green-100 border-green-500 text-green-800' : 'bg-gray-50 border-gray-200 hover:border-green-300'}`}>
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  TRUE
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setUserAnswer('false')} disabled={showFeedback} className={`p-6 rounded-xl text-xl font-bold transition-all border-2 ${userAnswer === 'false' ? 'bg-red-100 border-red-500 text-red-800' : 'bg-gray-50 border-gray-200 hover:border-red-300'}`}>
                  <XCircle className="w-12 h-12 mx-auto mb-2" />
                  FALSE
                </motion.button>
              </div>
            )}
            {currentExercise.type === 'drag-drop' && currentExercise.options && (
              <div className="mb-6">
                {/* Drop zone - where words are arranged */}
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-4 min-h-[100px] border-2 border-dashed border-primary-300">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Your answer:</p>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {draggedWords.length === 0 ? (
                      <p className="text-gray-400 italic">Drag words here to form a sentence...</p>
                    ) : (
                      draggedWords.map((word, index) => (
                        <motion.button
                          key={index}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (!showFeedback) {
                              setDraggedWords(prev => prev.filter((_, i) => i !== index));
                            }
                          }}
                          disabled={showFeedback}
                          className="px-4 py-2 bg-white border-2 border-primary-400 rounded-lg text-gray-800 font-medium hover:bg-red-50 hover:border-red-400 transition-all cursor-pointer"
                        >
                          {word}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Word bank - available words */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Available words:</p>
                  <div className="flex flex-wrap gap-3">
                    {currentExercise.options
                      .filter(word => !draggedWords.includes(word))
                      .map((word, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!showFeedback) {
                              setDraggedWords(prev => [...prev, word]);
                            }
                          }}
                          disabled={showFeedback}
                          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-primary-50 hover:border-primary-400 transition-all cursor-pointer shadow-sm"
                        >
                          {word}
                        </motion.button>
                      ))}
                  </div>
                </div>
              </div>
            )}
            <AnimatePresence>
              {showFeedback && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-xl p-6 mb-6 ${isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />}
                    <div>
                      <h4 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        {isCorrect ? 'Excellent! 🎉' : 'Not quite right'}
                      </h4>
                      <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>{currentExercise.explanation}</p>
                      {!isCorrect && <p className="mt-2 text-red-700 font-medium">Correct answer: <span className="underline">{String(currentExercise.correctAnswer)}</span></p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-4">
              {!showFeedback ? (
                <button 
                  onClick={handleAnswer} 
                  disabled={!userAnswer && Object.keys(selectedParts).length === 0 && draggedWords.length === 0} 
                  className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2">
                  {currentExerciseIndex < totalExercises - 1 ? 'Next Question' : 'Complete Lesson'}
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const accuracy = Math.round((correctAnswers / totalExercises) * 100);
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-8 shadow-2xl text-white">
          <div className="text-center mb-8">
            <Trophy className="w-20 h-20 mx-auto mb-4" />
            <h2 className="text-4xl font-bold mb-2">Lesson Complete!</h2>
            <p className="text-xl opacity-90">Amazing work! You&apos;re making great progress!</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">Score</p>
              <p className="text-3xl font-bold">{score}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">Accuracy</p>
              <p className="text-3xl font-bold">{accuracy}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">XP Earned</p>
              <p className="text-3xl font-bold">+{lesson.xpReward}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm opacity-90">Coins</p>
              <p className="text-3xl font-bold">+{lesson.coinReward}</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Lesson Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Correct Answers:</span><span className="font-bold">{correctAnswers} / {totalExercises}</span></div>
              <div className="flex justify-between"><span>Time Spent:</span><span className="font-bold">{minutes}m {seconds}s</span></div>
              <div className="flex justify-between"><span>Best Streak:</span><span className="font-bold">{streak} 🔥</span></div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/lessons')} className="flex-1 bg-white text-primary-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all">More Lessons</button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 bg-white/20 backdrop-blur-sm py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all">Dashboard</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonPlayer;
