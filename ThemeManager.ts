export const THEME_KEY = 'theme';
export const THEMES = ['light', 'dark', 'alter'] as const;
export type Theme = typeof THEMES[number];

export const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(stored as Theme)) return stored as Theme;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.remove(...THEMES);
  document.documentElement.classList.add(theme);
  localStorage.setItem(THEME_KEY, theme);

  const meta = document.querySelector("meta[name='theme-color']");
  if (meta) {
    meta.setAttribute('content', {
      light: '#ffffff',
      dark: '#111827',
      alter: '#1e1e26'
    }[theme]);
  }
};
