'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeId = 'society-light' | 'midnight-elite' | 'neon-trust';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'kindkart-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('society-light');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    setThemeState('society-light');
    document.documentElement.setAttribute('data-theme', 'society-light');
    localStorage.setItem(STORAGE_KEY, 'society-light');
  }, []);

  const setTheme = (value: ThemeId) => {
    const forcedTheme: ThemeId = 'society-light';
    setThemeState(forcedTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', forcedTheme);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, forcedTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

