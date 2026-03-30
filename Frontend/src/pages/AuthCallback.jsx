// ===========================================
// Auth Callback Page
// Handles Google OAuth redirect with token
// ===========================================
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=auth_failed');
      return;
    }

    if (token) {
      setToken(token).then(() => {
        navigate('/dashboard');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, setToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-200">Authenticating...</p>
      </div>
    </div>
  );
}
