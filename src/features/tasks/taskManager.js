import { saveTask, getTask } from "./taskStorage";
import { getCurrentTime, getTodayLabel } from "./taskTime";

export function initTaskState(taskId) {
  const task = getTask(taskId);

  return {
    hours: task.hours || 0,
    minutes: task.minutes || 0,
    seconds: task.seconds || 0,
    isRunning: task.isRunning || false,
    isEditable: task.isEditable ?? true,
    isCompleted: task.isCompleted || false,
  };
}

export function updateTimer(taskId, state) {
  saveTask(taskId, {
    ...getTask(taskId),
    ...state,
  });
}

export function getProgress(setMinutes, spentSeconds) {
  if (!setMinutes) return 0;

  const total = setMinutes * 60;
  return Math.min((spentSeconds / total) * 100, 100);
}

export function toggleComplete(taskId, isDone) {
  const task = getTask(taskId);

  saveTask(taskId, {
    ...task,
    isCompleted: isDone,
    endTime: isDone ? getCurrentTime() : null,
  });
}

// Only sets start time once per task
export function setStartTime(taskId) {
  const task = getTask(taskId);

  if (!task.startTime) {
    saveTask(taskId, {
      ...task,
      startTime: getCurrentTime(),
      taskDay: getTodayLabel(),
    });
  }
}

export function resetTask(taskId) {
  saveTask(taskId, {
    ...getTask(taskId),
    hours: 0,
    minutes: 0,
    seconds: 0,
    spentTaskHours: 0,
    isRunning: false,
  });
}
