export function calculateDashboardStats(tasks) {
  let totalTasks = tasks.length;
  let totalSetSeconds = 0;
  let totalSpentSeconds = 0;

  tasks.forEach((task) => {
    totalSetSeconds += (parseInt(task.setTaskHours) || 0) * 60;
    totalSpentSeconds += parseInt(task.spentTaskHours) || 0;
  });

  const productivity = totalSetSeconds > 0 ? (totalSpentSeconds / totalSetSeconds) * 100 : 0;

  return {
    totalTasks,
    totalSetSeconds,
    totalSpentSeconds,
    productivity: isFinite(productivity) ? productivity : 0,
  };
}
