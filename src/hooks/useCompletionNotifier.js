import { useCallback, useEffect, useRef, useState } from "react";

import { calculateDashboardStats } from "../features/dashboard/dashboardController";
import { getProgress } from "../features/tasks/taskManager";

// Plays a soft audio cue when a task or daily goal is completed
const playNotificationSound = () => {
  try {
    const audio = new Audio("/src/assets/audios/notification-tone.mp3");
    audio.volume = 0.55;
    audio.play().catch(() => {});
  } catch {
    /* empty */
  }
};

export const useCompletionNotifier = ({ tasks, todayTasks, range, onUpdateTask }) => {
  const [popup, setPopup] = useState(null);
  const prevTaskStates = useRef(null);
  const prevProductivity = useRef(null);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  // Watches individual tasks for checkbox completion or 100% time progress
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      return;
    }

    // Build initial snapshot on first run so we have a baseline to diff against
    if (prevTaskStates.current === null) {
      const snapshot = {};
      tasks.forEach((task) => {
        const spentSeconds = task.spentTaskHours || 0;
        const targetMinutes = parseInt(task.setTaskHours || "0", 10);
        snapshot[task.id] = {
          isComplete: task.checkboxState || false,
          progress: getProgress(targetMinutes, spentSeconds),
        };
      });
      prevTaskStates.current = snapshot;
      return;
    }

    for (const task of tasks) {
      const spentSeconds = task.spentTaskHours || 0;
      const targetMinutes = parseInt(task.setTaskHours || "0", 10);
      const progress = getProgress(targetMinutes, spentSeconds);

      const currState = {
        isComplete: task.checkboxState || false,
        progress,
      };

      const prevState = prevTaskStates.current[task.id] || {
        isComplete: false,
        progress: 0,
      };

      prevTaskStates.current[task.id] = currState;

      // Clear notification flag if the task was unchecked or dropped below 100%
      const shouldResetNotification =
        !currState.isComplete && currState.progress < 100 && task.notificationShown;

      if (shouldResetNotification) {
        onUpdateTask(task.id, { notificationShown: false });
        continue;
      }

      const justChecked = !prevState.isComplete && currState.isComplete;
      const justHit100 = targetMinutes > 0 && prevState.progress < 100 && currState.progress >= 100;
      const shouldNotify = (justChecked || justHit100) && !task.notificationShown;

      if (shouldNotify) {
        onUpdateTask(task.id, { notificationShown: true });
        setPopup({
          id: `task-${task.id}-${Date.now()}`,
          type: "task",
          taskName: task.editTaskName,
          taskDetails: task.editTaskDetails,
          spentSeconds,
          progress,
          targetMinutes,
        });
        playNotificationSound();
        break;
      }
    }
  }, [tasks, onUpdateTask]);

  // Watches overall daily productivity and fires once when it crosses 100%
  useEffect(() => {
    if (range !== "today") {
      prevProductivity.current = null;
      return;
    }

    if (!todayTasks || todayTasks.length === 0) {
      return;
    }

    const stats = calculateDashboardStats(todayTasks);
    const curr = stats.productivity;

    if (prevProductivity.current === null) {
      prevProductivity.current = curr;
      return;
    }

    const prev = prevProductivity.current;
    prevProductivity.current = curr;

    const todayTask = todayTasks.find((task) => task.dailyCompletionShown);

    // Clear the daily completion flag if productivity dropped back below 100%
    if (curr < 100 && todayTask) {
      onUpdateTask(todayTask.id, { dailyCompletionShown: false });
      return;
    }

    const shouldNotify = prev < 100 && curr >= 100 && stats.totalSetSeconds > 0 && !todayTask;

    if (shouldNotify) {
      const firstTask = todayTasks[0];
      if (firstTask) {
        onUpdateTask(firstTask.id, { dailyCompletionShown: true });
      }
      setPopup({
        id: `daily-${Date.now()}`,
        type: "daily",
        totalTasks: stats.totalTasks,
        totalSpentSeconds: stats.totalSpentSeconds,
        totalSetSeconds: stats.totalSetSeconds,
        productivity: curr,
      });
      playNotificationSound();
    }
  }, [todayTasks, range, onUpdateTask]);

  return {
    popup,
    closePopup,
  };
};
