// Read current theme state from the DOM
export const initializeTheme = () => {
  return document.documentElement.classList.contains("dark");
};

// Apply theme and persist preference
export const toggleTheme = (isDark) => {
  const bgColor = isDark ? "#070B14" : "#ffffff";

  document.documentElement.classList.toggle("dark", isDark);

  document.documentElement.style.backgroundColor = bgColor;

  document.body.style.backgroundColor = bgColor;

  localStorage.setItem("task-theme", isDark ? "dark" : "light");
};
