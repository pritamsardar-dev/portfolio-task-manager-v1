export function getRangeLabel(range) {
  switch (range) {
  case "today":
    return "Today's Tasks";

  case "yesterday":
    return "Yesterday's Tasks";

  case "week":
    return "Last 7 Days";

  case "month":
    return "Last 30 Days";

  case "custom":
    return "Custom Range";

  default:
    return "All Tasks";
  }
}

export function getRangeSubtitle(range) {
  switch (range) {
  case "today":
    return "Tasks created today.";

  case "yesterday":
    return "Tasks created yesterday.";

  case "week":
    return "Tasks from the last 7 days.";

  case "month":
    return "Tasks from the last 30 days.";

  case "custom":
    return "Tasks in your custom date range.";

  default:
    return "All saved tasks and productivity data.";
  }
}

// Check whether a task belongs to the selected range.
// Completed tasks use completedAt; open tasks use createdAt.
// Pinned open tasks always remain visible regardless of range.
export function isTaskInRange(task, range) {
  if (range === "all" || range === "custom") return true;

  if (task.isPinned && !task.checkboxState) return true;

  // Use completion date for finished tasks, creation date for open tasks
  const dateToCheck =
    task.checkboxState && task.completedAt ? new Date(task.completedAt) : new Date(task.createdAt);

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "today") {
    return dateToCheck >= startOfToday;
  }

  if (range === "yesterday") {
    const yesterday = new Date(startOfToday);

    yesterday.setDate(yesterday.getDate() - 1);

    return dateToCheck >= yesterday && dateToCheck < startOfToday;
  }

  if (range === "week") {
    const lastWeek = new Date(startOfToday);

    lastWeek.setDate(lastWeek.getDate() - 6);

    return dateToCheck >= lastWeek;
  }

  if (range === "month") {
    const lastMonth = new Date(startOfToday);

    lastMonth.setDate(lastMonth.getDate() - 29);

    return dateToCheck >= lastMonth;
  }

  return true;
}

// Format graph labels using short month and day
export function formatGraphDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}
