// ===========================================
// Theme Store (Zustand)
// Manages dark/light mode toggle
// ===========================================
import { create } from 'zustand';

const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark',
  
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.body.className = newTheme;
      return { theme: newTheme };
    }),

  initTheme: () =>
    set((state) => {
      document.body.className = state.theme;
      return state;
    }),
}));

export default useThemeStore;
