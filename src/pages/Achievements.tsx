import React from 'react';
import { useProgress } from '../contexts/ProgressContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle } from 'lucide-react';

const Achievements: React.FC = () => {
  const { achievements } = useProgress();
  useAuth(); // Keep for authentication check

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercent = (unlockedCount / totalCount) * 100;

  const achievementsByType = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.type]) {
      acc[achievement.type] = [];
    }
    acc[achievement.type].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const typeInfo: Record<string, { title: string; icon: string; color: string }> = {
    lessons: { title: 'Lesson Achievements', icon: '📚', color: 'blue' },
    streak: { title: 'Streak Achievements', icon: '🔥', color: 'orange' },
    accuracy: { title: 'Accuracy Achievements', icon: '🎯', color: 'green' },
    speed: { title: 'Speed Achievements', icon: '⚡', color: 'yellow' },
    special: { title: 'Special Achievements', icon: '⭐', color: 'purple' },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Achievements</h1>
        <p className="text-gray-600">Track your accomplishments and rewards</p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Progress</h2>
            <p className="text-gray-600">
              {unlockedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-500" />
        </div>
        <div className="progress-bar h-4">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{completionPercent.toFixed(1)}% Complete</p>
      </motion.div>

      {/* Achievements by Type */}
      {Object.entries(achievementsByType).map(([type, typeAchievements], idx) => {
        const info = typeInfo[type];
        return (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>{info.icon}</span>
              {info.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`card ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
                      : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    {achievement.unlocked ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-semibold">
                        +{achievement.reward.xp} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-semibold">
                        +{achievement.reward.coins} Coins
                      </span>
                    </div>
                  </div>
                  {!achievement.unlocked && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Requirement: {achievement.requirement} {achievement.type}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Achievements;
