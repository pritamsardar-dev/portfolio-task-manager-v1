// Task persistence helpers for reading and writing task data and ID sets from localStorage

export function saveTask(taskId, data) {
  localStorage.setItem(`task-${taskId}`, JSON.stringify(data));
}

export function getTask(taskId) {
  return JSON.parse(localStorage.getItem(`task-${taskId}`)) || {};
}

export function deleteTask(taskId) {
  localStorage.removeItem(`task-${taskId}`);
}

export function getTaskSet() {
  return JSON.parse(localStorage.getItem("taskSet")) || [];
}

export function saveTaskSet(set) {
  localStorage.setItem("taskSet", JSON.stringify(set));
}
