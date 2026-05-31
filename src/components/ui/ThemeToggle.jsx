import { useState } from "react";

import clsx from "clsx";

import { MoonIcon, SunIcon } from "../../assets/icons";
import { initializeTheme, toggleTheme } from "../../utils/theme";

const iconClasses = "w-[12px] h-[12px] sm:w-[13px] sm:h-[13px] lg:w-[14px] lg:h-[14px]";

// collapsed prop controls compact sidebar mode
// Compact mode shows only the knob until hover
function ThemeToggle({ collapsed = false }) {
  const [isDark, setIsDark] = useState(() => initializeTheme());
  const [hovered, setHovered] = useState(false);

  const handleToggle = () => {
    const next = !isDark;
    setIsDark(next);
    toggleTheme(next);
  };

  // Compact circle until hovered in collapsed sidebar
  const isCompact = collapsed && !hovered;

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Toggle theme"
      title=""
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: isCompact ? 28 : 56,
        height: 28,
        borderRadius: isCompact ? "50%" : 999,
        border: "1px solid var(--accent-border)",
        background: "var(--accent-bg)",
        cursor: "pointer",
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1), border-radius 0.26s ease",
        padding: 0,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Left Track Icon */}
      <span
        style={{
          position: "absolute",
          left: 6,
          display: "flex",
          alignItems: "center",
          opacity: isCompact ? 0 : isDark ? 0.22 : 0,
          transition: "opacity 0.26s ease",
          pointerEvents: "none",
        }}
      >
        <SunIcon className={clsx(iconClasses, "text-[var(--accent)]")} />
      </span>

      {/* Right Track Icon */}
      <span
        style={{
          position: "absolute",
          right: 6,
          display: "flex",
          alignItems: "center",
          opacity: isCompact ? 0 : isDark ? 0 : 0.22,
          transition: "opacity 0.26s ease",
          pointerEvents: "none",
        }}
      >
        <MoonIcon className={clsx(iconClasses, "text-[var(--accent)]")} />
      </span>

      {/* Sliding Knob */}
      <span
        style={{
          position: "absolute",
          top: 3,
          // Centers in compact mode, slides left/right in expanded mode
          left: isCompact ? 3 : isDark ? 29 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--accent)",
          boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
          transition: "left 0.26s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isDark ? (
          <MoonIcon className={clsx(iconClasses, "text-white")} />
        ) : (
          <SunIcon className={clsx(iconClasses, "text-white")} />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;
