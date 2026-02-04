import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendário de Vendas',
  description: 'Sistema de visualização de calendário com múltiplos temas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
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
                  } catch (e) {}
                  
                  const isDeviceDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  return isDeviceDark ? 'dark' : 'light';
                };

                const SET_THEME = (themeValue) => {
                  try {
                    localStorage.setItem(THEME_ATTRIBUTE_KEY, themeValue);
                  } catch (e) {}
                  
                  document.documentElement.classList.remove('dark', 'light', 'alter');
                  document.documentElement.classList.add(themeValue);
                  
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

                window.GET_THEME = GET_THEME;
                window.SET_THEME = SET_THEME;

                const initialTheme = GET_THEME();
                SET_THEME(initialTheme);
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
