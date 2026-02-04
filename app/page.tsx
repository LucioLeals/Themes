'use client';

import { ThemeProvider, useTheme } from '../ThemeContext';
import { Sun, Moon, Palette } from 'lucide-react';

console.log('[v0] Page component loading...');

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  console.log('[v0] ThemeToggle rendering with theme:', theme);

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
  console.log('[v0] PageContent rendering...');
  
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

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-8 text-center shadow-lg">
            <p className="text-foreground text-lg font-semibold">
              Sistema de Calendário
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Use o botão no canto superior direito para alternar entre os temas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="light:bg-red-50 light:border-red-200 dark:bg-red-950/70 dark:border-red-900/60 alter:bg-white/10 alter:border-white/20 border-2 rounded-lg p-6">
              <h3 className="light:text-red-700 dark:text-red-300 alter:text-red-200 font-bold mb-2">Tema Vermelho</h3>
              <p className="text-foreground text-sm">Exemplo de card com tema vermelho aplicado em todos os temas.</p>
            </div>

            <div className="light:bg-emerald-50 light:border-emerald-200 dark:bg-emerald-950/70 dark:border-emerald-900/60 alter:bg-white/10 alter:border-white/20 border-2 rounded-lg p-6">
              <h3 className="light:text-emerald-700 dark:text-emerald-300 alter:text-emerald-200 font-bold mb-2">Tema Verde</h3>
              <p className="text-foreground text-sm">Exemplo de card com tema verde aplicado em todos os temas.</p>
            </div>

            <div className="light:bg-blue-50 light:border-blue-200 dark:bg-blue-950/70 dark:border-blue-900/60 alter:bg-white/10 alter:border-white/20 border-2 rounded-lg p-6">
              <h3 className="light:text-blue-700 dark:text-blue-300 alter:text-blue-200 font-bold mb-2">Tema Azul</h3>
              <p className="text-foreground text-sm">Exemplo de card com tema azul aplicado em todos os temas.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-foreground text-xl font-bold mb-4">Preview dos Temas</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-32 text-muted-foreground text-sm">Background:</div>
                <div className="flex-1 bg-background border border-border rounded px-4 py-2 text-foreground">
                  Cor de fundo principal
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-muted-foreground text-sm">Card:</div>
                <div className="flex-1 bg-card border border-border rounded px-4 py-2 text-card-foreground">
                  Cor de card
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-muted-foreground text-sm">Primary:</div>
                <div className="flex-1 bg-primary border border-border rounded px-4 py-2 text-primary-foreground">
                  Cor primária
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-muted-foreground text-sm">Secondary:</div>
                <div className="flex-1 bg-secondary border border-border rounded px-4 py-2 text-secondary-foreground">
                  Cor secundária
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-muted-foreground text-sm">Accent:</div>
                <div className="flex-1 bg-accent border border-border rounded px-4 py-2 text-accent-foreground">
                  Cor de destaque
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  console.log('[v0] Main Page component rendering...');
  
  return (
    <ThemeProvider>
      <PageContent />
    </ThemeProvider>
  );
}
