// ===========================================
// Sidebar Component
// Premium navigation sidebar with glassmorphism
// ===========================================
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiChatBubbleLeftRight, HiTrophy,
  HiClock, HiUser, HiArrowRightOnRectangle,
  HiSun, HiMoon, HiBars3, HiXMark, HiSparkles,
} from 'react-icons/hi2';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const navItems = [
  { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { path: '/game', icon: HiChatBubbleLeftRight, label: 'New Game' },
  { path: '/leaderboard', icon: HiTrophy, label: 'Leaderboard' },
  { path: '/history', icon: HiClock, label: 'History' },
  { path: '/profile', icon: HiUser, label: 'Profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
          <HiSparkles />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-lg font-bold gradient-text">DealMind</h1>
            <p className="text-[10px] text-dark-200 -mt-1">Outsmart the Seller</p>
          </motion.div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-primary-500/5 text-primary-400 shadow-sm'
                  : theme === 'dark'
                  ? 'text-dark-200 hover:bg-dark-600 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110`}
            />
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 space-y-2 border-t border-dark-600/50">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            theme === 'dark' 
              ? 'text-dark-200 hover:bg-dark-600' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {theme === 'dark' ? (
            <HiSun className="w-5 h-5" />
          ) : (
            <HiMoon className="w-5 h-5" />
          )}
          {!collapsed && <span className="text-sm">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>}
        </button>

        {/* User Info */}
        {user && !collapsed && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'
          }`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user.username?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-[10px] text-dark-300 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-400 hover:bg-danger-400/10 transition-all"
        >
          <HiArrowRightOnRectangle className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-dark text-white"
      >
        <HiBars3 className="w-6 h-6" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`lg:hidden fixed left-0 top-0 h-full w-[280px] z-50 ${
                theme === 'dark' ? 'bg-dark-800' : 'bg-white'
              } shadow-2xl`}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-dark-300"
              >
                <HiXMark className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${
          theme === 'dark' 
            ? 'bg-dark-800 border-r border-dark-600/50' 
            : 'bg-white border-r border-gray-200'
        }`}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-8 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            theme === 'dark' 
              ? 'bg-dark-600 text-dark-200 hover:bg-dark-500' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } transition-all shadow-md`}
        >
          {collapsed ? '›' : '‹'}
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}
