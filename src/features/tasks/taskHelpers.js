import { isTaskInRange } from "../../utils/dateRange";

export function filterTasks(tasks, activeFilters, sortBy, range) {
  let filteredTasks = [...tasks];

  // Apply date range first
  filteredTasks = filteredTasks.filter((task) => isTaskInRange(task, range));

  // Apply status and priority filters
  if (activeFilters.length > 0 && !activeFilters.includes("all")) {
    filteredTasks = filteredTasks.filter((task) => {
      return activeFilters.some((filter) => {
        switch (filter) {
        case "open":
          return !task.checkboxState;
        case "closed":
          return task.checkboxState;
        case "high":
          return task.selectPriority === "High";
        case "medium":
          return task.selectPriority === "Medium";
        case "low":
          return task.selectPriority === "Low";
        default:
          return true;
        }
      });
    });
  }

  filteredTasks.sort((a, b) => {
    // Running tasks always sort to top
    const aRunning = a.isRunning && !a.checkboxState;
    const bRunning = b.isRunning && !b.checkboxState;

    if (aRunning !== bRunning) return aRunning ? -1 : 1;

    // Completed tasks sort below open tasks
    if (a.checkboxState !== b.checkboxState) return a.checkboxState ? 1 : -1;

    // Among open tasks, pinned tasks sort first, then by creation date
    if (!a.checkboxState && !b.checkboxState) {
      const aPin = !!a.isPinned;
      const bPin = !!b.isPinned;

      if (aPin !== bPin) return aPin ? -1 : 1;

      return sortBy === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt;
    }

    // Among completed tasks, sort by completion date
    const aDate = a.completedAt || a.createdAt;
    const bDate = b.completedAt || b.createdAt;

    return sortBy === "oldest" ? aDate - bDate : bDate - aDate;
  });

  return filteredTasks;
}

export function getFilterStats(tasks) {
  return {
    all: tasks.length,
    open: tasks.filter((task) => !task.checkboxState).length,
    closed: tasks.filter((task) => task.checkboxState).length,
    high: tasks.filter((task) => task.selectPriority === "High").length,
    medium: tasks.filter((task) => task.selectPriority === "Medium").length,
    low: tasks.filter((task) => task.selectPriority === "Low").length,
  };
}
