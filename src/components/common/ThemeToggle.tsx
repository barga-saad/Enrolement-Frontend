import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 dark:bg-dark-bg-soft hover:bg-orange-50 dark:hover:bg-bcp-orange/10 transition-colors duration-200 group shadow-sm border border-gray-200/80 dark:border-white/10 hover:border-bcp-orange/40"
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun className="w-[18px] h-[18px] text-bcp-orange group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-bcp-brown group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
};
