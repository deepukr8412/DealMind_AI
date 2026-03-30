// ===========================================
// App.jsx — Root Component
// Routes, theme initialization, toast setup
// ===========================================
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Store
import useThemeStore from './store/themeStore';
import useAuthStore from './store/authStore';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfileSetup from './pages/ProfileSetup';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Profile from './pages/Profile';

export default function App() {
  const { initTheme, theme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === 'dark' ? '#1a1a24' : '#ffffff',
            color: theme === 'dark' ? '#e5e5f0' : '#1a1a2e',
            border: `1px solid ${theme === 'dark' ? '#2d2d4a' : '#e5e5ea'}`,
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route path="/profile-setup" element={
          <ProtectedRoute><ProfileSetup /></ProtectedRoute>
        } />

        <Route element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}
