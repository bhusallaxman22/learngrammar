import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ProgressProvider } from './contexts/ProgressContext.tsx';
import Login from './pages/auth/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Lessons from './pages/Lessons.tsx';
import LessonPlayer from './components/LessonPlayer.tsx';
import Achievements from './pages/Achievements.tsx';
import Profile from './pages/Profile.tsx';
import AILessons from './pages/AILessons.tsx';
import LevelAssessment from './pages/assessment/LevelAssessment.tsx';
import Navbar from './components/Navbar.tsx';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

// App Layout with Navbar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Lessons />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LessonPlayer />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Achievements />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-lessons"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AILessons />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LevelAssessment />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
