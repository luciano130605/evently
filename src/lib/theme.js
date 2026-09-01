export const THEME_STORAGE_KEY = "mis15-theme";

export function resolveThemePreference() {
    if (typeof window === "undefined") {
        return "light";
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "light" || stored === "dark") {
        return stored;
    }

    return "light";
}

export function applyTheme(nextTheme = resolveThemePreference()) {
    if (typeof document === "undefined") {
        return nextTheme;
    }

    const root = document.documentElement;
    root.dataset.theme = nextTheme;

    if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    return nextTheme;
}
