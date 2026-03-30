// ===========================================
// Layout Component
// Wraps authenticated pages with sidebar
// ===========================================
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useThemeStore from '../store/themeStore';

export default function Layout() {
  const { theme } = useThemeStore();

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'bg-dark-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
