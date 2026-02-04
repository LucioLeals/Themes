"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";

type Theme = "light" | "dark" | "alter";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Declaração das funções globais para TypeScript
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
  // Inicializa com o tema atual do DOM (já aplicado pelo script inline)
  const [theme, setTheme] = useState<Theme>(() => {
    // Durante SSR, retorna 'light' como fallback
    if (typeof window === 'undefined') {
      return 'light';
    }
    
    // No cliente, usa a função global para obter o tema atual
    try {
      return window.GET_THEME?.() || 'light';
    } catch {
      return 'light';
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Sincroniza o estado com o DOM uma única vez após a hidratação
    if (typeof window !== 'undefined' && window.GET_THEME) {
      const currentTheme = window.GET_THEME();
      setTheme(currentTheme);
      setIsInitialized(true);
    }
  }, []);

  const toggleTheme = () => {
    // Ciclo: light -> dark -> alter -> light
    const themeOrder: Theme[] = ["light", "dark", "alter"];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const newTheme = themeOrder[nextIndex];
    
    // Atualiza o estado local
    setTheme(newTheme);
    
    // Usa a função global para aplicar o tema imediatamente
    if (typeof window !== 'undefined' && window.SET_THEME) {
      window.SET_THEME(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
