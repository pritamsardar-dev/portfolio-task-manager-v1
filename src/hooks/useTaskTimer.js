import { useCallback, useEffect, useRef, useState } from "react";

import { addDailyTime, getDateKey } from "../utils/dailyTimeStorage";

function secondsToHMS(raw) {
  const total = Math.max(0, Math.floor(raw));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

// Computes display time from wall clock so the timer stays accurate after tab switches or refreshes
function wallClockDisplay(timerStartedAt, baseSpentSeconds) {
  const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
  return secondsToHMS(baseSpentSeconds + elapsed);
}

export function useTaskTimer(task, onUpdateTask, isTemplateView) {
  const [isRunning, setIsRunning] = useState(task.isRunning || false);

  // Restores live display immediately if the timer was running before a page refresh
  const [time, setTime] = useState(() => {
    if (task.isRunning && task.timerStartedAt && !isTemplateView) {
      return wallClockDisplay(task.timerStartedAt, task.baseSpentSeconds || 0);
    }
    return secondsToHMS(task.spentTaskHours || 0);
  });

  // Mutable refs hold timer state that must not trigger rerenders
  const timerStartedAtRef = useRef(task.timerStartedAt || null);
  const baseSpentSecondsRef = useRef(task.baseSpentSeconds ?? task.spentTaskHours ?? 0);
  const isRunningRef = useRef(task.isRunning || false);
  const intervalRef = useRef(null);
  const lastSaveRef = useRef(0);
  const lastRecordedSecondsRef = useRef(task.spentTaskHours || 0);

  // Keeps refs in sync when the parent updates task props externally
  useEffect(() => {
    timerStartedAtRef.current = task.timerStartedAt || null;
    baseSpentSecondsRef.current = task.baseSpentSeconds ?? task.spentTaskHours ?? 0;
  }, [task.timerStartedAt, task.baseSpentSeconds, task.spentTaskHours]);

  // Syncs local running state when the task is paused or resumed from outside this hook
  useEffect(() => {
    const running = task.isRunning || false;
    isRunningRef.current = running;

    if (!running) {
      lastRecordedSecondsRef.current = task.spentTaskHours || 0;
    }

    // queueMicrotask defers state updates until after the current render cycle
    queueMicrotask(() => {
      setIsRunning(running);
      if (!running) {
        setTime(secondsToHMS(task.spentTaskHours || 0));
      }
    });
  }, [task.isRunning, task.spentTaskHours]);

  // Drives the per-second display tick while the timer is active
  useEffect(() => {
    if (!isRunning || isTemplateView) {
      clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      const startedAt = timerStartedAtRef.current;
      if (!startedAt) {
        return;
      }
      setTime(wallClockDisplay(startedAt, baseSpentSecondsRef.current));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isRunning, isTemplateView]);

  // Snaps display back to the correct value when the tab regains focus after being hidden
  useEffect(() => {
    if (!isRunning || isTemplateView) {
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        return;
      }
      const startedAt = timerStartedAtRef.current;
      if (!startedAt) {
        return;
      }
      setTime(wallClockDisplay(startedAt, baseSpentSecondsRef.current));
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isRunning, isTemplateView]);

  // Throttled persist — writes task state and daily time delta at most once per 800ms
  useEffect(() => {
    if (isTemplateView || !isRunning) {
      return;
    }

    const now = Date.now();
    if (now - lastSaveRef.current < 800) {
      return;
    }

    lastSaveRef.current = now;

    const spentTaskHours = time.hours * 3600 + time.minutes * 60 + time.seconds;

    const delta = spentTaskHours - lastRecordedSecondsRef.current;
    if (delta > 0) {
      addDailyTime(getDateKey(), delta);
      lastRecordedSecondsRef.current = spentTaskHours;
    }

    const frame = requestAnimationFrame(() => {
      onUpdateTask(task.id, {
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds,
        spentTaskHours,
        updatedAt: Date.now(),
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [time, isRunning, task.id, onUpdateTask, isTemplateView]);

  const toggleTimer = useCallback(() => {
    if (!isRunningRef.current) {
      const currentTotal = time.hours * 3600 + time.minutes * 60 + time.seconds;
      const now = Date.now();

      timerStartedAtRef.current = now;
      baseSpentSecondsRef.current = currentTotal;
      isRunningRef.current = true;
      setIsRunning(true);

      onUpdateTask(task.id, {
        isRunning: true,
        timerStartedAt: now,
        baseSpentSeconds: currentTotal,
      });
    } else {
      const startedAt = timerStartedAtRef.current;
      const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      const total = baseSpentSecondsRef.current + elapsed;
      const hms = secondsToHMS(total);

      // Flush any remaining daily delta before pausing
      const delta = total - lastRecordedSecondsRef.current;
      if (delta > 0) {
        addDailyTime(getDateKey(), delta);
        lastRecordedSecondsRef.current = total;
      }

      timerStartedAtRef.current = null;
      isRunningRef.current = false;
      setTime(hms);
      setIsRunning(false);

      onUpdateTask(task.id, {
        isRunning: false,
        timerStartedAt: null,
        baseSpentSeconds: total,
        ...hms,
        spentTaskHours: total,
      });
    }
  }, [time, task.id, onUpdateTask]);

  // Stops the timer immediately, flushes the daily delta, and persists final state
  const forceStop = useCallback(() => {
    clearInterval(intervalRef.current);

    const startedAt = timerStartedAtRef.current;
    const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
    const total = baseSpentSecondsRef.current + elapsed;
    const hms = secondsToHMS(total);

    const delta = total - lastRecordedSecondsRef.current;
    if (delta > 0) {
      addDailyTime(getDateKey(), delta);
      lastRecordedSecondsRef.current = total;
    }

    timerStartedAtRef.current = null;
    isRunningRef.current = false;
    setTime(hms);
    setIsRunning(false);

    onUpdateTask(task.id, {
      isRunning: false,
      timerStartedAt: null,
      baseSpentSeconds: total,
      ...hms,
      spentTaskHours: total,
    });
  }, [task.id, onUpdateTask]);

  const setManualTime = useCallback(
    (totalSeconds) => {
      const total = Math.max(0, Math.floor(totalSeconds));
      const hms = secondsToHMS(total);

      setTime(hms);
      baseSpentSecondsRef.current = total;
      // Reset the daily delta baseline so the next tick only records new time
      lastRecordedSecondsRef.current = total;

      if (isRunningRef.current) {
        const now = Date.now();
        timerStartedAtRef.current = now;
        onUpdateTask(task.id, {
          ...hms,
          spentTaskHours: total,
          baseSpentSeconds: total,
          timerStartedAt: now,
        });
      } else {
        onUpdateTask(task.id, {
          ...hms,
          spentTaskHours: total,
          baseSpentSeconds: total,
          timerStartedAt: null,
        });
      }
    },
    [task.id, onUpdateTask],
  );

  return {
    time,
    isRunning,
    toggleTimer,
    forceStop,
    setManualTime,
  };
}
