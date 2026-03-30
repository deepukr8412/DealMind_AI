// ===========================================
// Profile Setup Page
// Post-registration profile completion
// ===========================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCamera, HiUser, HiPencil, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import ImageCropper from '../components/ImageCropper';

export default function ProfileSetup() {
  const { user, updateProfile, uploadAvatar } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [preview, setPreview] = useState(user?.avatar || '');
  const [cropSrc, setCropSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedBlob) => {
    setCropSrc(null); // Close modal
    
    // Preview locally
    const fileUrl = URL.createObjectURL(croppedBlob);
    setPreview(fileUrl);
    
    // Upload standard file to ImageKit via backend
    setUploading(true);
    try {
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      await uploadAvatar(file);
      toast.success('Avatar uploaded successfully! 📸');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profile complete! Let\'s negotiate! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' ? 'bg-dark-900' : 'bg-gradient-to-br from-primary-50 to-white'
    }`}>
      {/* Cropper Modal */}
      {cropSrc && (
        <ImageCropper 
          imageSrc={cropSrc} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setCropSrc(null)} 
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-lg ${
          theme === 'dark' ? 'glass-dark' : 'glass-light'
        } rounded-2xl p-8 shadow-2xl`}
      >
        <div className="text-center mb-8">
          <HiCheckCircle className="w-12 h-12 text-success-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold gradient-text">Complete Your Profile</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-dark-200' : 'text-gray-500'}`}>
            Set up your profile to get started
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative">
            <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${
              theme === 'dark' ? 'border-dark-500' : 'border-gray-200'
            } ${uploading ? 'animate-pulse opacity-50' : ''} bg-black flex items-center justify-center`}>
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
                  <HiUser className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
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
          {uploading && <span className="text-xs text-primary-400 mt-2 font-medium">Uploading to cloud...</span>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>Username</label>
            <div className="relative">
              <HiUser className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-1 focus:ring-primary-500 ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-medium mb-1 block ${
              theme === 'dark' ? 'text-dark-200' : 'text-gray-600'
            }`}>Bio</label>
            <div className="relative">
              <HiPencil className={`absolute left-3 top-3 w-5 h-5 ${
                theme === 'dark' ? 'text-dark-300' : 'text-gray-400'
              }`} />
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                maxLength={200}
                rows={3}
                className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none resize-none transition-all focus:ring-1 focus:ring-primary-500 ${
                  theme === 'dark'
                    ? 'bg-dark-700 border border-dark-500 text-white focus:border-primary-500'
                    : 'bg-white border border-gray-200 text-gray-900 focus:border-primary-500'
                }`}
                placeholder="Tell us about yourself..."
              />
            </div>
            <p className={`text-right text-xs mt-1 ${theme === 'dark' ? 'text-dark-300' : 'text-gray-400'}`}>
              {formData.bio.length}/200
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full btn-primary text-white py-3 rounded-xl font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Complete Setup & Start Playing'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
