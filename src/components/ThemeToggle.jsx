import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";

export default function ThemeToggle({ theme = "light", onToggleTheme }) {
    const isDark = theme === "light";

    return (
        <button
            type="button"
            className="theme-toggle"
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            aria-pressed={isDark}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            onClick={onToggleTheme}
        >
            <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
            </span>
            <HugeiconsIcon
                icon={isDark ? Sun01Icon : Moon02Icon}
                size={15}
            />
        </button>
    );
}
