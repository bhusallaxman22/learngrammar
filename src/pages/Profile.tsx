import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProgress } from '../contexts/ProgressContext.tsx';
import { motion } from 'framer-motion';
import { User, BookOpen, Trophy, Flame, Star, Mail, Calendar, Award, Coins } from 'lucide-react';
import { allLessons } from '../data/lessons.ts';

const Profile: React.FC = () => {
  const { userData } = useAuth();
  const { currentLevel, achievements, userProgress } = useProgress();

  if (!userData) return null;

  const completedLessons = userData.completedLessons.length;
  const totalLessons = allLessons.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  // Calculate average score
  const avgScore =
    userProgress.length > 0
      ? Math.round(userProgress.reduce((sum, p) => sum + p.score, 0) / userProgress.length)
      : 0;

  // Calculate total time spent
  const totalTimeSpent = userProgress.reduce((sum, p) => sum + p.timeSpent, 0);
  const hoursSpent = Math.floor(totalTimeSpent / 3600);
  const minutesSpent = Math.floor((totalTimeSpent % 3600) / 60);

  const memberSince = new Date(userData.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">View your learning statistics and progress</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{userData.displayName}</h2>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {userData.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-primary-100 to-primary-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Level</span>
                  <span className="text-2xl">{currentLevel.icon}</span>
                </div>
                <p className="text-3xl font-bold text-primary-700">{userData.level}</p>
                <p className="text-sm text-gray-600">{currentLevel.title}</p>
                <div className="mt-3">
                  <div className="progress-bar h-2">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          ((userData.xp - currentLevel.minXP) /
                            (currentLevel.maxXP - currentLevel.minXP)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {userData.xp} / {currentLevel.maxXP} XP
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-700">{userData.streak}</p>
                    <p className="text-xs text-gray-600">days in a row</p>
                  </div>
                  <Flame className="w-12 h-12 text-orange-600" />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 mb-1">Total Coins</p>
                    <p className="text-3xl font-bold text-yellow-700">{userData.coins}</p>
                  </div>
                  <Coins className="w-12 h-12 text-yellow-600" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Stats Overview */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Learning Statistics
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {completedLessons}/{totalLessons}
                </p>
                <div className="progress-bar h-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Achievements Unlocked</p>
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {unlockedAchievements}/{achievements.length}
                </p>
                <div className="progress-bar h-2">
                  <div
                    className="progress-fill bg-gradient-to-r from-purple-500 to-purple-600"
                    style={{ width: `${(unlockedAchievements / achievements.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-6 bg-green-50 rounded-lg">
                <Star className="w-8 h-8 text-green-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-4xl font-bold text-green-600">{avgScore}%</p>
              </div>

              <div className="p-6 bg-orange-50 rounded-lg">
                <Calendar className="w-8 h-8 text-orange-600 mb-3" />
                <p className="text-sm text-gray-600 mb-1">Time Spent Learning</p>
                <p className="text-4xl font-bold text-orange-600">
                  {hoursSpent}h {minutesSpent}m
                </p>
              </div>
            </div>
          </div>

          {/* Progress by Category */}
          <div className="card">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Progress by Category</h3>
            <div className="space-y-4">
              {[
                { category: 'subject-verb-object', name: 'Subject-Verb-Object', color: 'blue' },
                { category: 'tenses', name: 'Tenses', color: 'green' },
                { category: 'conditionals', name: 'Conditionals', color: 'purple' },
                { category: 'subject-verb-agreement', name: 'Subject-Verb Agreement', color: 'orange' },
              ].map(({ category, name, color }) => {
                const categoryLessons = allLessons.filter(
                  (l: any) => l.category === category
                ).length;
                const completedInCategory = userData.completedLessons.filter((id: string) =>
                  allLessons.find((l: any) => l.id === id && l.category === category)
                ).length;
                const percent = (completedInCategory / categoryLessons) * 100;

                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">{name}</span>
                      <span className="text-gray-600">
                        {completedInCategory}/{categoryLessons}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`bg-gradient-to-r from-${color}-500 to-${color}-600 h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Badges */}
          {userData.badges.length > 0 && (
            <div className="card">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Badges</h3>
              <div className="flex flex-wrap gap-4">
                {userData.badges.map(badge => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{badge.name}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
