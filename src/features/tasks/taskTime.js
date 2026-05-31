// Date and time utilities for task filtering, display labels, and clock formatting

export function formatTime(hours, minutes, seconds) {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  const s = String(seconds).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function getTodayLabel() {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function getYesterdayLabel() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

export function getTaskDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Compares task createdAt against named range boundaries computed at call time
export function isTaskInRange(task, range) {
  if (range === "all") {
    return true;
  }

  const taskDate = new Date(task.createdAt);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 6);
  last7Days.setHours(0, 0, 0, 0);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 29);
  last30Days.setHours(0, 0, 0, 0);

  switch (range) {
  case "today":
    return taskDate >= startOfToday;
  case "yesterday":
    return taskDate >= startOfYesterday && taskDate < startOfToday;
  case "week":
    return taskDate >= last7Days;
  case "month":
    return taskDate >= last30Days;
  default:
    return true;
  }
}

export function getRangeTitle(range) {
  switch (range) {
  case "today":
    return "Today's Tasks";
  case "yesterday":
    return "Yesterday's Tasks";
  case "week":
    return "Last 7 Days Tasks";
  case "month":
    return "Last 30 Days Tasks";
  case "all":
    return "All Tasks";
  default:
    return "Tasks";
  }
}
