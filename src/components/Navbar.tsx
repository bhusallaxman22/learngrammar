import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { BookOpen, Home, Trophy, User, LogOut, Menu, X, Coins, Flame, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/lessons', icon: BookOpen, label: 'Lessons' },
    { to: '/ai-lessons', icon: Sparkles, label: 'AI Lessons' },
    { to: '/assessment', icon: Brain, label: 'Assessment' },
    { to: '/achievements', icon: Trophy, label: 'Achievements' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">GrammarQuest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive(link.to)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Info & Stats */}
          <div className="hidden md:flex items-center gap-4">
            {userData && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-lg">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">{userData.coins}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-700">{userData.streak}</span>
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-2">
              {userData && (
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-lg">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">{userData.coins}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="font-bold text-orange-700">{userData.streak}</span>
                  </div>
                </div>
              )}
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    isActive(link.to)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
