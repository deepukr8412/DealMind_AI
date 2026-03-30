// ===========================================
// Profile Page
// User profile with stats, achievements, avatar
// ===========================================
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HiUser, HiCamera, HiPencilSquare,
  HiTrophy, HiChartBar, HiCurrencyDollar,
  HiCheckCircle, HiStar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import ImageCropper from '../components/ImageCropper';

export default function Profile() {
  const { user, updateProfile, uploadAvatar, fetchUser } = useAuthStore();
  const { theme } = useThemeStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  });
  
  const [cropSrc, setCropSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropSrc(null); // Close modal
    
    // Upload standard file to ImageKit via backend
    setUploading(true);
    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      await uploadAvatar(file);
      await fetchUser(); // Reload latest
      toast.success('Avatar updated! 📸');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const stats = user?.stats || {};
  const achievements = user?.achievements || [];

  const statItems = [
    { label: 'Total Games', value: stats.totalGames || 0, icon: HiChartBar },
    { label: 'Games Won', value: stats.gamesWon || 0, icon: HiTrophy },
    { label: 'Best Score', value: `${stats.bestScore || 0}%`, icon: HiStar },
    { label: 'Avg Score', value: `${stats.avgScore || 0}%`, icon: HiChartBar },
    { label: 'Total Saved', value: `$${(stats.totalSaved || 0).toLocaleString()}`, icon: HiCurrencyDollar },
    { label: 'Win Rate', value: stats.totalGames ? `${Math.round((stats.gamesWon / stats.totalGames) * 100)}%` : '0%', icon: HiCheckCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 max-w-4xl mx-auto"
    >
      {/* Cropper Modal */}
      {cropSrc && (
        <ImageCropper 
          imageSrc={cropSrc} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropSrc(null)} 
        />
      )}

      {/* Profile Header */}
      <div className={`rounded-2xl p-8 mb-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 ${
        theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-400/10" />

        <div className="relative">
          <div className={`w-24 h-24 rounded-full overflow-hidden border-4 flex items-center justify-center bg-black ${
            theme === 'dark' ? 'border-dark-500' : 'border-gray-200'
          } ${uploading ? 'animate-pulse opacity-50' : ''}`}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-3xl text-white font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600"
          >
            <HiCamera className="w-4 h-4" />
          </button>
          <input 
            ref={fileRef} 
            type="file" 
            accept="image/*" 
            onChange={handleFileSelect} 
            onClick={(e) => e.target.value = null} 
            className="hidden" 
          />
        </div>

        <div className="flex-1 text-center sm:text-left relative z-10 w-full">
          {uploading && <p className="text-xs text-primary-400 mb-2 font-medium">Uploading to cloud...</p>}
          
          {editing ? (
            <div className="space-y-3">
              <input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-2 rounded-xl text-sm outline-none transition focus:ring-1 focus:ring-primary-500 ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={200}
                rows={2}
                className={`w-full px-4 py-2 rounded-xl text-sm outline-none resize-none transition focus:ring-1 focus:ring-primary-500 ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary flex-1 sm:flex-none text-white px-6 py-2 rounded-xl text-sm justify-center">
                  Save
                </button>
                <button onClick={() => setEditing(false)} className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-sm justify-center transition ${
                  theme === 'dark' ? 'bg-dark-600 text-dark-200 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className={`p-1.5 rounded-lg transition ${
                    theme === 'dark' ? 'hover:bg-dark-600 text-dark-200 hover:text-primary-400' : 'hover:bg-gray-100 text-gray-400 hover:text-primary-500'
                  }`}
                >
                  <HiPencilSquare className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-sm ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
                {user?.email}
              </p>
              {user?.bio && (
                <p className={`text-sm mt-2 max-w-lg ${theme === 'dark' ? 'text-dark-300' : 'text-gray-600'}`}>
                  {user.bio}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-5 ${
              theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <stat.icon className={`w-6 h-6 mb-3 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className={`rounded-2xl p-6 ${
        theme === 'dark' ? 'bg-dark-800 border border-dark-600/50' : 'bg-white border border-gray-200 shadow-sm'
      }`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <HiStar className="w-6 h-6 text-yellow-400" />
          Achievements ({achievements.length})
        </h3>
        {achievements.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl transition ${
                  theme === 'dark' ? 'bg-dark-700 hover:bg-dark-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-400/20 flex items-center justify-center">
                  <span className="text-2xl">{a.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold">{a.name}</p>
                  <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-500'}`}>
                    {a.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-6 text-sm ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
            Play games to unlock achievements! 🏆
          </p>
        )}
      </div>
    </motion.div>
  );
}
