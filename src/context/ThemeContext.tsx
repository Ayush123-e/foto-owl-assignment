/**
 * ThemeContext – global theme state (light and dark modes).
 *
 * Provides current theme, colors, and a function to toggle themes.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  card: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  inputBackground: string;
  error: string;
  success: string;
  buttonText: string;
  tabBarBackground: string;
  statusBar: 'light-content' | 'dark-content';
}

const themeColors: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#f8fafc',
    card: '#ffffff',
    primary: '#6c63ff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    inputBackground: '#f1f5f9',
    error: '#ef4444',
    success: '#22c55e',
    buttonText: '#ffffff',
    tabBarBackground: '#ffffff',
    statusBar: 'dark-content',
  },
  dark: {
    background: '#0f0f1a',
    card: '#1a1a2e',
    primary: '#6c63ff',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    border: '#2a2a40',
    inputBackground: '#16213e',
    error: '#ef4444',
    success: '#22c55e',
    buttonText: '#ffffff',
    tabBarBackground: '#1a1a2e',
    statusBar: 'light-content',
  },
};

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>('dark'); // Default to dark premium theme

  // Load saved theme on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setTheme(saved);
        } else if (systemColorScheme === 'light' || systemColorScheme === 'dark') {
          setTheme(systemColorScheme);
        }
      } catch {
        // Fallback silently
      }
    })();
  }, [systemColorScheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = theme === 'dark';
    return {
      theme,
      colors: themeColors[theme],
      isDark,
      toggleTheme,
    };
  }, [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
