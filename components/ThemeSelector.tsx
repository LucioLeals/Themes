'use client';

import { useTheme } from '@/ThemeContext';
import { Sun, Moon, Sparkles, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Theme = 'light' | 'dark' | 'alter';

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    bg: string;
    accent: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Interface clara e limpa',
    icon: <Sun className="w-4 h-4" />,
    colors: {
      bg: 'bg-white',
      accent: 'bg-blue-500',
    },
  },
  {
    value: 'dark',
    label: 'Escuro',
    description: 'Modo noturno elegante',
    icon: <Moon className="w-4 h-4" />,
    colors: {
      bg: 'bg-slate-900',
      accent: 'bg-indigo-500',
    },
  },
  {
    value: 'alter',
    label: 'Alter',
    description: 'Visual moderno e vibrante',
    icon: <Sparkles className="w-4 h-4" />,
    colors: {
      bg: 'bg-slate-800',
      accent: 'bg-violet-500',
    },
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentTheme = themeOptions.find((t) => t.value === theme) || themeOptions[0];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm hover:bg-accent/50 hover:border-border transition-all duration-200 shadow-sm"
        aria-label="Selecionar tema"
      >
        <span className="text-foreground/80">{currentTheme?.icon}</span>
        <span className="text-sm font-medium text-foreground/90 hidden sm:inline">
          {currentTheme?.label}
        </span>
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/60 bg-popover/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Selecione um tema
              </p>
              <div className="space-y-1 mt-1">
                {themeOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleThemeChange(option.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                      theme === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent/70 text-foreground/80'
                    }`}
                  >
                    {/* Theme preview */}
                    <div
                      className={`relative w-8 h-8 rounded-lg ${option.colors.bg} border border-border/30 shadow-inner overflow-hidden flex-shrink-0`}
                    >
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1.5 ${option.colors.accent}`}
                      />
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{option.label}</span>
                        {theme === option.value && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>

                    {/* Icon */}
                    <span
                      className={`${
                        theme === option.value
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      } transition-colors`}
                    >
                      {option.icon}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick toggle hint */}
            <div className="px-4 py-2.5 bg-muted/30 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                Dica: Use <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">T</kbd> para alternar rapidamente
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact version for tight spaces
export function ThemeSelectorCompact() {
  const { theme, toggleTheme } = useTheme();

  const currentIcon =
    theme === 'light' ? (
      <Sun className="w-4 h-4" />
    ) : theme === 'dark' ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sparkles className="w-4 h-4" />
    );

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-border/60 bg-card/80 backdrop-blur-sm hover:bg-accent/50 hover:border-border transition-all duration-200 shadow-sm"
      aria-label="Alternar tema"
      title={`Tema atual: ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Alter'}`}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
        transition={{ duration: 0.2 }}
        className="text-foreground/80"
      >
        {currentIcon}
      </motion.div>
    </button>
  );
}
