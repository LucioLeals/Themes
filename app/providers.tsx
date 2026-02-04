'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '../ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Keyboard shortcut for theme toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        if (typeof window !== 'undefined' && window.GET_THEME && window.SET_THEME) {
          const currentTheme = window.GET_THEME();
          const themeOrder: ('light' | 'dark' | 'alter')[] = ['light', 'dark', 'alter'];
          const currentIndex = themeOrder.indexOf(currentTheme);
          const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
          window.SET_THEME(nextTheme);
          // Dispatch custom event for React state sync
          window.dispatchEvent(new CustomEvent('themeChange', { detail: nextTheme }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
