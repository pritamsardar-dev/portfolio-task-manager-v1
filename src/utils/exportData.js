// Format timestamps using the same date and time style used across the task UI
function formatFullDateTime(timestamp) {
  if (!timestamp) return "";

  const d = new Date(timestamp);

  const date = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${date} ${time}`;
}

export function exportTasksAsJson(tasks, filename = "tasks-export") {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.json`;

  link.click();

  window.URL.revokeObjectURL(url);
}

export function exportTasksAsCsv(tasks, filename = "tasks-export") {
  if (!tasks.length) return;

  const headers = [
    "Task Name",
    "Task Details",
    "Priority",
    "Target Minutes",
    "Spent Hours",
    "Status",
    "Created",
    "Completed",
  ];

  const rows = tasks.map((task) => [
    task.editTaskName || "",
    task.editTaskDetails || "",
    task.selectPriority || "",
    task.setTaskHours || "",
    ((task.spentTaskHours || 0) / 3600).toFixed(2),
    task.checkboxState ? "Completed" : "Open",
    formatFullDateTime(task.createdAt),
    task.completedAt ? formatFullDateTime(task.completedAt) : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((item) => `"${item}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${filename}.csv`;

  link.click();

  window.URL.revokeObjectURL(url);
}
