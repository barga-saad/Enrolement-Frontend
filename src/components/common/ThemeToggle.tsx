import React, { useEffect, useState } from 'react';
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
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl bg-gray-100 dark:bg-dark-bg-soft hover:bg-bcp-orange-soft dark:hover:bg-bcp-orange-soft transition-all duration-300 group"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-bcp-orange group-hover:rotate-45 transition-transform duration-500" />
      ) : (
        <Moon className="w-5 h-5 text-bcp-brown group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </button>
  );
};
