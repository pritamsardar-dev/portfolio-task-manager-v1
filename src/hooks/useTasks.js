import { useCallback, useState } from "react";

import {
  getTaskSet,
  saveTaskSet,
  getTask,
  saveTask,
  deleteTask,
} from "../features/tasks/taskStorage";
import { getCurrentTime } from "../features/tasks/taskTime";
import { getTemplates, saveTemplates } from "../utils/templateStorage";

export function useTasks() {
  // Lazy initializers run once before first render
  const [tasks, setTasks] = useState(() => {
    const taskIds = getTaskSet();
    return taskIds.map((id) => ({
      id,
      ...getTask(id),
    }));
  });

  const [templates, setTemplates] = useState(() => getTemplates());

  // Batches state update and localStorage writes inside rAF to avoid layout thrashing
  const syncTasks = useCallback((updatedTasks) => {
    requestAnimationFrame(() => {
      setTasks(updatedTasks);
      saveTaskSet(updatedTasks.map((task) => task.id));
      updatedTasks.forEach((task) => {
        saveTask(task.id, task);
      });
    });
  }, []);

  const addTask = useCallback(() => {
    const id = Date.now();
    const now = Date.now();

    const newTask = {
      id,
      editTaskName: "",
      editTaskDetails: "",
      selectPriority: "",
      setTaskHours: "",
      spentTaskHours: 0,
      checkboxState: false,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isRunning: false,
      notificationShown: false,
      dailyCompletionShown: false,
      timerStartedAt: null,
      baseSpentSeconds: 0,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      startTime: getCurrentTime(),
      endTime: "00:00",
    };

    syncTasks([...tasks, newTask]);
  }, [tasks, syncTasks]);

  const addTemplate = useCallback(() => {
    const newTemplate = {
      id: Date.now(),
      editTaskName: "",
      editTaskDetails: "",
      selectPriority: "",
      setTaskHours: "",
      spentTaskHours: 0,
      checkboxState: false,
      notificationShown: false,
      dailyCompletionShown: false,
      isPinned: false,
      createdAt: Date.now(),
      completedAt: null,
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
  }, [templates]);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        return {
          ...task,
          ...updates,
          updatedAt: Date.now(),
        };
      });

      saveTaskSet(updatedTasks.map((task) => task.id));
      updatedTasks.forEach((task) => {
        saveTask(task.id, task);
      });

      return updatedTasks;
    });
  }, []);

  const updateTemplate = useCallback(
    (taskId, updates) => {
      const updatedTemplates = templates.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        return {
          ...task,
          ...updates,
        };
      });

      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
    },
    [templates],
  );

  const deleteTaskById = useCallback(
    (taskId) => {
      deleteTask(taskId);
      syncTasks(tasks.filter((task) => task.id !== taskId));
    },
    [tasks, syncTasks],
  );

  const deleteTemplate = useCallback(
    (taskId) => {
      const updatedTemplates = templates.filter((task) => task.id !== taskId);
      setTemplates(updatedTemplates);
      saveTemplates(updatedTemplates);
    },
    [templates],
  );

  const toggleTaskComplete = useCallback(
    (taskId, checked) => {
      const updates = {
        checkboxState: checked,
        endTime: checked ? getCurrentTime() : "00:00",
        completedAt: checked ? Date.now() : null,
      };

      // Completed tasks lose pin state
      if (checked) {
        updates.isPinned = false;
      }

      updateTask(taskId, updates);
    },
    [updateTask],
  );

  const toggleTaskPin = useCallback(
    (taskId) => {
      const task = tasks.find((taskItem) => taskItem.id === taskId);

      // Completed tasks cannot be pinned
      if (!task || task.checkboxState) {
        return;
      }

      updateTask(taskId, { isPinned: !task.isPinned });
    },
    [tasks, updateTask],
  );

  const resetTaskTimer = useCallback(
    (taskId) => {
      updateTask(taskId, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        spentTaskHours: 0,
        isRunning: false,
        timerStartedAt: null,
        baseSpentSeconds: 0,
      });
    },
    [updateTask],
  );

  // Stamps each template with a fresh id and resets all runtime state before importing
  const importTemplateTasks = useCallback(() => {
    if (!templates.length) {
      return;
    }

    const now = Date.now();

    const importedTasks = templates.map((task) => ({
      ...task,
      id: now + Math.floor(Math.random() * 100000),
      checkboxState: false,
      spentTaskHours: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isRunning: false,
      timerStartedAt: null,
      baseSpentSeconds: 0,
      isPinned: false,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
      startTime: getCurrentTime(),
      endTime: "00:00",
    }));

    syncTasks([...tasks, ...importedTasks]);
  }, [tasks, templates, syncTasks]);

  return {
    tasks,
    templates,
    addTask,
    addTemplate,
    updateTask,
    updateTemplate,
    deleteTask: deleteTaskById,
    deleteTemplate,
    toggleTaskComplete,
    toggleTaskPin,
    resetTaskTimer,
    importTemplateTasks,
  };
}
