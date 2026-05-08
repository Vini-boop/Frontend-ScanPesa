// ThemeToggle.jsx - Light/Dark mode toggle button
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === "light" ? "Night Mode" : "Day Mode"}
        </button>
    );
}
