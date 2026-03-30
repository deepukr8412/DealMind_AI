import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { resetPassword, loading, error, clearError } = useAuthStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!passwordRegex.test(password)) {
      toast.error('Password must include uppercase, lowercase, number, and symbol');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      toast.success('Password successfully reset! 🚀');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-dark-900' : 'bg-gradient-to-br from-primary-50 to-white'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md relative z-10 ${
          theme === 'dark' ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-8 shadow-2xl`}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-400 mx-auto flex items-center justify-center mb-4 shadow-lg glow-primary">
            <HiLockClosed className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Create New Password</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            Enter your new secure password below
          </p>
        </div>

        {error && (
          <div className="bg-danger-500/10 border border-danger-500/20 text-danger-500 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className={`p-4 rounded-xl border mb-6 ${
              theme === 'dark' ? 'bg-dark-700 border-dark-600' : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              Password reset successful. You can now login using your new password.
            </div>
            <Link
              to="/login"
              className="w-full btn-primary block text-center py-3 rounded-xl font-medium transition-all hover:bg-primary-600"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1 block opacity-70">New Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Aa1@••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none border transition-all ${
                    theme === 'dark' ? 'bg-dark-700 border-dark-600 focus:border-primary-500' : 'bg-white border-gray-200 focus:border-primary-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition hover:bg-black/10"
                >
                  {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block opacity-70">Confirm New Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all ${
                    theme === 'dark' ? 'bg-dark-700 border-dark-600 focus:border-primary-500' : 'bg-white border-gray-200 focus:border-primary-500'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
