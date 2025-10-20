import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import type { UserProgress, Achievement, LevelInfo } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';

interface ProgressContextType {
  userProgress: UserProgress[];
  achievements: Achievement[];
  currentLevel: LevelInfo;
  completeLesson: (lessonId: string, score: number, timeSpent: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  addXP: (amount: number) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  loading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

// Level system configuration
const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Beginner', minXP: 0, maxXP: 100, icon: '🌱', color: 'green' },
  { level: 2, title: 'Learner', minXP: 100, maxXP: 250, icon: '📚', color: 'blue' },
  { level: 3, title: 'Student', minXP: 250, maxXP: 500, icon: '✏️', color: 'indigo' },
  { level: 4, title: 'Scholar', minXP: 500, maxXP: 1000, icon: '🎓', color: 'purple' },
  { level: 5, title: 'Expert', minXP: 1000, maxXP: 2000, icon: '🏆', color: 'yellow' },
  { level: 6, title: 'Master', minXP: 2000, maxXP: 5000, icon: '👑', color: 'orange' },
  { level: 7, title: 'Grammar Guru', minXP: 5000, maxXP: 10000, icon: '⭐', color: 'red' },
  { level: 8, title: 'Legend', minXP: 10000, maxXP: Infinity, icon: '🌟', color: 'pink' },
];

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userData, updateUserData } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentLevel, setCurrentLevel] = useState<LevelInfo>(LEVELS[0]);
  const [loading, setLoading] = useState(true);

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Load user progress
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', currentUser.uid)
        );
        const progressSnapshot = await getDocs(progressQuery);
        const progressData = progressSnapshot.docs.map(doc => doc.data() as UserProgress);
        setUserProgress(progressData);

        // Load achievements
        const achievementsSnapshot = await getDoc(doc(db, 'achievements', 'all'));
        if (achievementsSnapshot.exists()) {
          const allAchievements = achievementsSnapshot.data().list as Achievement[];
          const userAchievements = userData?.achievements || [];
          const updatedAchievements = allAchievements.map(achievement => ({
            ...achievement,
            unlocked: userAchievements.includes(achievement.id),
          }));
          setAchievements(updatedAchievements);
        }

        // Calculate current level
        if (userData) {
          const level = LEVELS.find(l => userData.xp >= l.minXP && userData.xp < l.maxXP) || LEVELS[0];
          setCurrentLevel(level);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [currentUser, userData]);

  const completeLesson = async (lessonId: string, score: number, timeSpent: number) => {
    if (!currentUser || !userData) return;

    // Update progress
    const progressRef = doc(db, 'progress', `${currentUser.uid}_${lessonId}`);
    const existingProgress = userProgress.find(p => p.lessonId === lessonId);
    
    const newProgress: UserProgress = {
      userId: currentUser.uid,
      lessonId,
      status: 'completed',
      score: Math.max(score, existingProgress?.score || 0),
      attempts: (existingProgress?.attempts || 0) + 1,
      completedAt: new Date().toISOString(),
      timeSpent: (existingProgress?.timeSpent || 0) + timeSpent,
    };

    await setDoc(progressRef, newProgress);
    setUserProgress(prev => {
      const filtered = prev.filter(p => p.lessonId !== lessonId);
      return [...filtered, newProgress];
    });

    // Add to completed lessons if not already there
    if (!userData.completedLessons.includes(lessonId)) {
      await updateUserData({
        completedLessons: [...userData.completedLessons, lessonId],
      });
    }

    // Award XP and coins
    const xpReward = Math.floor(score * 10);
    const coinReward = Math.floor(score / 10);
    await addXP(xpReward);
    await addCoins(coinReward);
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!currentUser || !userData) return;

    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    // Update user achievements
    await updateUserData({
      achievements: [...userData.achievements, achievementId],
    });

    // Award achievement rewards
    await addXP(achievement.reward.xp);
    await addCoins(achievement.reward.coins);

    // Update local state
    setAchievements(prev =>
      prev.map(a => (a.id === achievementId ? { ...a, unlocked: true } : a))
    );
  };

  const addXP = async (amount: number) => {
    if (!userData) return;

    const newXP = userData.xp + amount;
    const newLevel = LEVELS.find(l => newXP >= l.minXP && newXP < l.maxXP) || LEVELS[0];

    await updateUserData({ xp: newXP, level: newLevel.level });
    setCurrentLevel(newLevel);
  };

  const addCoins = async (amount: number) => {
    if (!userData) return;
    await updateUserData({ coins: userData.coins + amount });
  };

  const updateStreak = async () => {
    if (!userData) return;

    const today = new Date().toDateString();
    const lastActive = new Date(userData.lastActiveDate).toDateString();

    if (today !== lastActive) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastActive === yesterday ? userData.streak + 1 : 1;

      await updateUserData({
        streak: newStreak,
        lastActiveDate: new Date().toISOString(),
      });

      // Check for streak achievements
      if (newStreak === 7) await unlockAchievement('streak-7');
      if (newStreak === 30) await unlockAchievement('streak-30');
      if (newStreak === 100) await unlockAchievement('streak-100');
    }
  };

  const value: ProgressContextType = {
    userProgress,
    achievements,
    currentLevel,
    completeLesson,
    unlockAchievement,
    addXP,
    addCoins,
    updateStreak,
    loading,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};
