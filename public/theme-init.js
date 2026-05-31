// Apply saved theme before React renders
(function () {
  try {
    const savedTheme = localStorage.getItem("task-theme");
    const isDark = savedTheme === "dark";
    const bgColor = isDark ? "#070B14" : "#ffffff";
    const root = document.documentElement;

    root.classList.toggle("dark", isDark);
    root.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
  } catch {
    // Ignore storage errors
  }
})();
