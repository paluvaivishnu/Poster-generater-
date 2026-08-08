// ============================================
// BrandForge AI — App Router
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BrandKitPage from './pages/BrandKitPage';
import GeneratePage from './pages/GeneratePage';
import PosterEditorPage from './pages/PosterEditorPage';
import HistoryPage from './pages/HistoryPage';

// Protected route wrapper — redirects to login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route — redirects to dashboard if already authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/brand-kit" element={<ProtectedRoute><BrandKitPage /></ProtectedRoute>} />
      <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
      <Route path="/editor/:posterId?" element={<ProtectedRoute><PosterEditorPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
