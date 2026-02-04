import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Providers } from './providers';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Calendario de Vendas',
  description: 'Sistema de visualizacao de calendario com multiplos temas',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} ${robotoMono.variable}`} suppressHydrationWarning>
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
