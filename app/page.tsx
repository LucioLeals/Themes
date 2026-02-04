'use client';

import { ThemeProvider } from '../ThemeContext';
import CalendarioMensalRealTime from '../CalendarioMensalRealTime';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const icons = {
    light: <Sun className="w-5 h-5" />,
    dark: <Moon className="w-5 h-5" />,
    alter: <Palette className="w-5 h-5" />,
  };

  const labels = {
    light: 'Light',
    dark: 'Dark',
    alter: 'Alter',
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-card/90 backdrop-blur-md border border-border/60 text-foreground hover:bg-accent/50 transition-all duration-200 shadow-lg"
      title={`Current theme: ${theme}. Click to cycle themes.`}
    >
      {icons[theme]}
      <span className="text-sm font-medium">{labels[theme]}</span>
    </button>
  );
}

function PageContent() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Calendário de Vendas
          </h1>
          <p className="text-muted-foreground">
            Visualização mensal de leads e contatos por vendedor
          </p>
        </div>

        <CalendarioMensalRealTime isActive={true} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PageContent />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
