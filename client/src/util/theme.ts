export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "devcheck-theme";

export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

export const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const resolveInitialTheme = (): Theme =>
  getStoredTheme() ?? getSystemTheme();

export const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
};

export const initializeTheme = (): Theme => {
  const resolvedTheme = resolveInitialTheme();
  applyTheme(resolvedTheme);
  return resolvedTheme;
};

export const setThemePreference = (theme: Theme): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  applyTheme(theme);
};
