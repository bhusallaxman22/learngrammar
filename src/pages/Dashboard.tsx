import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProgress } from '../contexts/ProgressContext.tsx';
import { motion } from 'framer-motion';
import { Trophy, Coins, Flame, Star, BookOpen, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allLessons } from '../data/lessons.ts';

const Dashboard: React.FC = () => {
  const { userData } = useAuth();
  const { currentLevel, achievements } = useProgress();

  if (!userData) return null;

  const completedCount = userData.completedLessons.length;
  const totalLessons = allLessons.length;
  const progressPercent = (completedCount / totalLessons) * 100;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {userData.displayName}!
        </h1>
        <p className="text-gray-600">Ready to continue your grammar journey?</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Level</p>
              <p className="text-3xl font-bold text-gray-800">{userData.level}</p>
              <p className="text-xs text-gray-500">{currentLevel.title}</p>
            </div>
            <div className="text-4xl">{currentLevel.icon}</div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${((userData.xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userData.xp} / {currentLevel.maxXP} XP
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1">Coins</p>
              <p className="text-3xl font-bold">{userData.coins}</p>
            </div>
            <Coins className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-gradient-to-br from-orange-400 to-red-500 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1">Streak</p>
              <p className="text-3xl font-bold">{userData.streak}</p>
              <p className="text-xs">days in a row</p>
            </div>
            <Flame className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-gradient-to-br from-purple-400 to-purple-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1">Achievements</p>
              <p className="text-3xl font-bold">
                {unlockedAchievements}/{achievements.length}
              </p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600" />
            Your Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Lessons Completed</span>
                <span className="font-semibold text-gray-800">
                  {completedCount} / {totalLessons}
                </span>
              </div>
              <div className="progress-bar h-4">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Subject-Verb-Object</p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    userData.completedLessons.filter(id =>
                      allLessons.find(l => l.id === id)?.category === 'subject-verb-object'
                    ).length
                  }
                  /2
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Tenses</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    userData.completedLessons.filter(id =>
                      allLessons.find(l => l.id === id)?.category === 'tenses'
                    ).length
                  }
                  /2
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Conditionals</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    userData.completedLessons.filter(id =>
                      allLessons.find(l => l.id === id)?.category === 'conditionals'
                    ).length
                  }
                  /2
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Agreement</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    userData.completedLessons.filter(id =>
                      allLessons.find(l => l.id === id)?.category === 'subject-verb-agreement'
                    ).length
                  }
                  /1
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            Recent Achievements
          </h2>
          <div className="space-y-3">
            {achievements
              .filter(a => a.unlocked)
              .slice(0, 5)
              .map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">{achievement.title}</p>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            {unlockedAchievements === 0 && (
              <p className="text-gray-500 text-center py-8">
                Complete lessons to unlock achievements!
              </p>
            )}
          </div>
          <Link
            to="/achievements"
            className="block mt-4 text-center text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All Achievements →
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <Link to="/lessons" className="card hover:shadow-2xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Continue Learning</h3>
            <p className="text-gray-600 text-sm">Explore grammar lessons</p>
          </div>
        </Link>

        <Link to="/achievements" className="card hover:shadow-2xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Achievements</h3>
            <p className="text-gray-600 text-sm">Track your accomplishments</p>
          </div>
        </Link>

        <Link to="/profile" className="card hover:shadow-2xl transition-shadow">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Profile</h3>
            <p className="text-gray-600 text-sm">View your statistics</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
