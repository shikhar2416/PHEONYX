import { Sun, Moon } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('attendify-theme', 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
