"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "alter";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

// Declaracao das funcoes globais para TypeScript
declare global {
  interface Window {
    GET_THEME: () => Theme;
    SET_THEME: (theme: Theme) => void;
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicializa com o tema atual do DOM (ja aplicado pelo script inline)
  const [theme, setThemeState] = useState<Theme>(() => {
    // Durante SSR, retorna 'light' como fallback
    if (typeof window === 'undefined') {
      return 'light';
    }
    
    // No cliente, usa a funcao global para obter o tema atual
    try {
      return window.GET_THEME?.() || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    // Sincroniza o estado com o DOM uma unica vez apos a hidratacao
    if (typeof window !== 'undefined' && window.GET_THEME) {
      const currentTheme = window.GET_THEME();
      setThemeState(currentTheme);
    }

    // Listen for theme changes from keyboard shortcuts
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined' && window.SET_THEME) {
      window.SET_THEME(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Ciclo: light -> dark -> alter -> light
    const themeOrder: Theme[] = ["light", "dark", "alter"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const newTheme = themeOrder[nextIndex];
    setTheme(newTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
