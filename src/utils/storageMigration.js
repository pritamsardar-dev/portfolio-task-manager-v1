// Normalize task objects and fill missing fields with safe default values
export function migrateTask(task) {
  return {
    editTaskName: task.editTaskName || "",
    editTaskDetails: task.editTaskDetails || "",
    selectPriority: task.selectPriority || "",
    setTaskHours: task.setTaskHours || "",
    spentTaskHours: task.spentTaskHours || 0,
    checkboxState: task.checkboxState || false,
    hours: task.hours || 0,
    minutes: task.minutes || 0,
    seconds: task.seconds || 0,
    isRunning: task.isRunning || false,
    notificationShown: task.notificationShown || false,
    dailyCompletionShown: task.dailyCompletionShown || false,
    taskDay: task.taskDay || "Today",
    startTime: task.startTime || "00:00",
    endTime: task.endTime || "00:00",
    createdAt: task.createdAt || Date.now(),
    updatedAt: task.updatedAt || Date.now(),
    completedAt: task.completedAt || null,
  };
}
