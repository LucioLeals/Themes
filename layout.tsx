// Exemplo de integração do sistema de loading no layout existente do IAPV3
// Este arquivo mostra como integrar sem quebrar a estrutura atual

import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ApiProvider } from '@/services';
import { ToastProvider } from '@/components/ui/Toast';
import ErrorFilter from '@/components/ErrorFilter';
import ConnectionStatus from '@/components/ConnectionStatus';

// 🚀 NOVOS IMPORTS PARA LOADING
import { SimpleLoadingIntegration, SimpleServiceWorkerScript } from './simple-loading-integration';

export const metadata: Metadata = {
  title: 'IA de Pós-Vendas',
  description: 'Sistema Inteligente de Análise de Pós-Vendas',
  icons: {
    icon: [
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Ícones de aplicação */}
        <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        {/* 🚀 SERVICE WORKER SCRIPT - Registra SW o mais cedo possível */}
        <SimpleServiceWorkerScript />
        
        {/* Script de tema existente */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const THEME_ATTRIBUTE_KEY = 'theme';
                
                const GET_THEME = () => {
                  try {
                    const savedTheme = localStorage.getItem(THEME_ATTRIBUTE_KEY);
                    if (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'alter') {
                      return savedTheme;
                    }
                  } catch (e) {
                    // localStorage pode não estar disponível (modo privado)
                  }
                  
                  // Fallback para preferência do sistema
                  const isDeviceDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  return isDeviceDark ? 'dark' : 'light';
                };

                const SET_THEME = (themeValue) => {
                  try {
                    localStorage.setItem(THEME_ATTRIBUTE_KEY, themeValue);
                  } catch (e) {
                    // localStorage pode não estar disponível
                  }
                  
                  // Remove todas as classes de tema
                  document.documentElement.classList.remove('dark', 'light', 'alter');
                  
                  // Adiciona a classe do tema atual
                  document.documentElement.classList.add(themeValue);
                  
                  // Atualiza meta theme-color para mobile
                  const metaThemeColor = document.querySelector("meta[name='theme-color']");
                  if (metaThemeColor) {
                    const themeColors = {
                      'light': '#ffffff',
                      'dark': '#111827',
                      'alter': '#1e1e26'
                    };
                    metaThemeColor.setAttribute('content', themeColors[themeValue] || '#ffffff');
                  }
                };

                // Disponibiliza as funções globalmente para uso no React
                window.GET_THEME = GET_THEME;
                window.SET_THEME = SET_THEME;

                // Aplica o tema imediatamente antes do primeiro paint
                const initialTheme = GET_THEME();
                SET_THEME(initialTheme);
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-sans">
        <ErrorFilter />
        <ConnectionStatus />

        <ThemeProvider>
          <AuthProvider>
            <ApiProvider>
              <ToastProvider>
                <SidebarProvider>
                  {/* 🚀 LOADING INTEGRATION - Envolve children com sistema de loading */}
                  <SimpleLoadingIntegration>
                    {children}
                  </SimpleLoadingIntegration>
                </SidebarProvider>
              </ToastProvider>
            </ApiProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

/*
🔧 INSTRUÇÕES DE INTEGRAÇÃO:

1. BACKUP DO LAYOUT ATUAL:
   - Renomeie layout.tsx para layout-original.tsx
   - Renomeie layout-with-loading.tsx para layout.tsx

2. INSTALAR DEPENDÊNCIA:
   npm install framer-motion

3. TESTAR:
   - Navegue entre páginas
   - Observe o loading overlay
   - Verifique console para logs de debug

4. PERSONALIZAR:
   - Edite config/navigationLoading.ts
   - Ajuste timings por página
   - Configure temas

5. LINKS INTELIGENTES:
   - Substitua Link por NavigationLink
   - Use NavigationArea para interceptar áreas
   - Configure exclusões com classe 'no-loading'

6. ROLLBACK (se necessário):
   - Renomeie layout.tsx para layout-with-loading.tsx
   - Renomeie layout-original.tsx para layout.tsx
*/