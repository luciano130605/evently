import { HugeiconsIcon } from "@hugeicons/react";
import {
  Moon02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";

export default function ThemeToggle({
  theme = "light",
  onToggleTheme,
}) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? "is-dark" : "is-light"}`}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      aria-pressed={isDark}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      onClick={onToggleTheme}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb">
          <HugeiconsIcon
            icon={isDark ? Moon02Icon : Sun01Icon}
            size={14}
            strokeWidth={2}
          />
        </span>
      </span>
    </button>
  );
}