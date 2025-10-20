import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Trophy, Star, Flame, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Exercise } from '../types/index.ts';
import { useProgress } from '../contexts/ProgressContext.tsx';

interface AIQuizPlayerProps {
  exercises: Exercise[];
  onComplete: () => void;
  onBack: () => void;
}

const AIQuizPlayer: React.FC<AIQuizPlayerProps> = ({ exercises, onComplete, onBack }) => {
  const { updateStreak } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;

  const handleAnswer = () => {
    let correct = false;
    
    if (currentExercise.type === 'identify-parts') {
      const requiredParts = currentExercise.sentenceParts?.filter(p => p.correct) || [];
      correct = requiredParts.every(part => selectedParts[part.id] === part.type);
    } else if (currentExercise.type === 'true-false') {
      correct = userAnswer.toLowerCase() === String(currentExercise.correctAnswer).toLowerCase();
    } else {
      correct = userAnswer.toLowerCase().trim() === String(currentExercise.correctAnswer).toLowerCase().trim();
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
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setSelectedParts({});
      setShowFeedback(false);
      setShowHint(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    await updateStreak();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setCompleted(true);
  };

  const togglePartSelection = (partId: string, partType: string) => {
    setSelectedParts(prev => ({ ...prev, [partId]: prev[partId] === partType ? '' : partType }));
  };

  if (completed) {
    const accuracy = Math.round((correctAnswers / exercises.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-8 shadow-2xl text-white"
      >
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-xl opacity-90">Great job! You finished all {exercises.length} questions!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90">Score</p>
            <p className="text-3xl font-bold">{score}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90">Accuracy</p>
            <p className="text-3xl font-bold">{accuracy}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90">Correct</p>
            <p className="text-3xl font-bold">{correctAnswers}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90">Best Streak</p>
            <p className="text-3xl font-bold">{streak} 🔥</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-white text-primary-600 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all"
          >
            Generate More
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-white/20 backdrop-blur-sm py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all"
          >
            Done
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Question {currentIndex + 1} of {exercises.length}
          </span>
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
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentExercise.difficulty === 'easy'
                ? 'bg-green-100 text-green-700'
                : currentExercise.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {currentExercise.difficulty.toUpperCase()} • {currentExercise.points} points
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Lightbulb className="w-5 h-5" />
            {showHint ? 'Hide' : 'Show'} Hint
          </button>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentExercise.question}</h3>

        {/* Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6"
            >
              <p className="text-blue-800">{currentExercise.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiple Choice */}
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
                  userAnswer === option
                    ? 'bg-primary-100 border-primary-500 text-primary-800'
                    : 'bg-gray-50 border-gray-200 hover:border-primary-300 text-gray-700'
                } ${
                  showFeedback && option === currentExercise.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : ''
                } ${
                  showFeedback && userAnswer === option && !isCorrect
                    ? 'bg-red-100 border-red-500'
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
        )}

        {/* Identify Parts */}
        {currentExercise.type === 'identify-parts' && currentExercise.sentenceParts && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-4">
              <div className="flex flex-wrap gap-2">
                {currentExercise.sentenceParts.map(part => (
                  <motion.span
                    key={part.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !showFeedback && togglePartSelection(part.id, part.type)}
                    className={`inline-block px-3 py-2 rounded-lg cursor-pointer transition-all border-2 font-medium ${
                      selectedParts[part.id] === 'subject'
                        ? 'bg-blue-200 border-blue-500 text-blue-900 underline decoration-2'
                        : selectedParts[part.id] === 'verb'
                        ? 'bg-green-200 border-green-500 text-green-900 underline decoration-2'
                        : selectedParts[part.id] === 'object'
                        ? 'bg-purple-200 border-purple-500 text-purple-900 underline decoration-2'
                        : selectedParts[part.id] === 'modifier'
                        ? 'bg-yellow-200 border-yellow-500 text-yellow-900 underline decoration-2'
                        : 'bg-white border-gray-300 hover:border-primary-400 hover:shadow-md'
                    } ${showFeedback ? 'cursor-default' : ''}`}
                  >
                    {part.text}
                  </motion.span>
                ))}
              </div>
            </div>
            {!showFeedback && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]);
                    if (unselected) togglePartSelection(unselected.id, 'subject');
                  }}
                  className="p-3 bg-blue-100 border-2 border-blue-300 rounded-lg text-blue-800 font-semibold hover:bg-blue-200 transition-all"
                >
                  🔵 Subject
                </button>
                <button
                  onClick={() => {
                    const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]);
                    if (unselected) togglePartSelection(unselected.id, 'verb');
                  }}
                  className="p-3 bg-green-100 border-2 border-green-300 rounded-lg text-green-800 font-semibold hover:bg-green-200 transition-all"
                >
                  🟢 Verb
                </button>
                <button
                  onClick={() => {
                    const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]);
                    if (unselected) togglePartSelection(unselected.id, 'object');
                  }}
                  className="p-3 bg-purple-100 border-2 border-purple-300 rounded-lg text-purple-800 font-semibold hover:bg-purple-200 transition-all"
                >
                  🟣 Object
                </button>
                <button
                  onClick={() => {
                    const unselected = currentExercise.sentenceParts?.find(p => !selectedParts[p.id]);
                    if (unselected) togglePartSelection(unselected.id, 'modifier');
                  }}
                  className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-semibold hover:bg-yellow-200 transition-all"
                >
                  🟡 Modifier
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fill in Blank */}
        {currentExercise.type === 'fill-blank' && (
          <div className="mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="Type your answer here..."
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
            />
          </div>
        )}

        {/* True/False */}
        {currentExercise.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserAnswer('true')}
              disabled={showFeedback}
              className={`p-6 rounded-xl text-xl font-bold transition-all border-2 ${
                userAnswer === 'true'
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : 'bg-gray-50 border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              TRUE
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setUserAnswer('false')}
              disabled={showFeedback}
              className={`p-6 rounded-xl text-xl font-bold transition-all border-2 ${
                userAnswer === 'false'
                  ? 'bg-red-100 border-red-500 text-red-800'
                  : 'bg-gray-50 border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              FALSE
            </motion.button>
          </div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-xl p-6 mb-6 ${
                isCorrect
                  ? 'bg-green-50 border-2 border-green-500'
                  : 'bg-red-50 border-2 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h4
                    className={`font-bold text-lg mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {isCorrect ? 'Excellent! 🎉' : 'Not quite right'}
                  </h4>
                  <p className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                    {currentExercise.explanation}
                  </p>
                  {!isCorrect && (
                    <p className="mt-2 text-red-700 font-medium">
                      Correct answer: <span className="underline">{String(currentExercise.correctAnswer)}</span>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!showFeedback ? (
            <button
              onClick={handleAnswer}
              disabled={!userAnswer && Object.keys(selectedParts).length === 0}
              className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
            >
              {currentIndex < exercises.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ArrowRight className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuizPlayer;
