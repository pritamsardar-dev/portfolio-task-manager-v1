import { useCallback, useEffect, useState } from "react";

const AUTO_CLOSE_MS = 5500;

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `
      ${h}h
      ${String(m).padStart(2, "0")}m
      ${String(s).padStart(2, "0")}s
    `;
  }

  return `
    ${String(m).padStart(2, "0")}m
    ${String(s).padStart(2, "0")}s
  `;
}

function AnimatedCheck() {
  return (
    <div className="completion-check-wrap">
      <svg
        className="completion-check-svg"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle
          cx="40"
          cy="40"
          r="38"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeDasharray="239"
          strokeDashoffset="239"
          className="completion-ring-outer"
        />

        {/* Main Ring */}
        <circle
          cx="40"
          cy="40"
          r="32"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeDasharray="201"
          strokeDashoffset="201"
          strokeLinecap="round"
          className="completion-ring-main"
        />

        {/* Checkmark */}
        <path
          d="M24 41L35 52L56 28"
          stroke="var(--accent)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="50"
          strokeDashoffset="50"
          className="completion-tick"
        />
      </svg>

      {/* Pulse Effect */}
      <div className="completion-pulse" />
    </div>
  );
}

function TaskCompletionContent({ data }) {
  return (
    <>
      <p className="completion-label">Task Complete</p>

      <p className="completion-title">{data.taskName || "Untitled Task"}</p>

      {data.taskDetails && <p className="completion-detail">{data.taskDetails}</p>}

      {/* Completion Stats */}
      <div className="completion-stats">
        <div className="completion-stat">
          <span className="completion-stat-label">Time Spent</span>

          <span className="completion-stat-value">{formatDuration(data.spentSeconds || 0)}</span>
        </div>

        <div className="completion-stat-divider" />

        <div className="completion-stat">
          <span className="completion-stat-label">Progress</span>

          <span className="completion-stat-value">
            {Math.min(data.progress || 0, 100).toFixed(0)}%
          </span>
        </div>

        {data.targetMinutes > 0 && (
          <>
            <div className="completion-stat-divider" />

            <div className="completion-stat">
              <span className="completion-stat-label">Target</span>

              <span className="completion-stat-value">{data.targetMinutes} min</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function DailyCompletionContent({ data }) {
  return (
    <>
      <p className="completion-label">Daily Goal Reached 🎉</p>

      <p className="completion-title">Today's Productivity: 100%</p>

      {/* Daily Stats */}
      <div className="completion-stats">
        <div className="completion-stat">
          <span className="completion-stat-label">Tasks</span>

          <span className="completion-stat-value">{data.totalTasks}</span>
        </div>

        <div className="completion-stat-divider" />

        <div className="completion-stat">
          <span className="completion-stat-label">Time Spent</span>

          <span className="completion-stat-value">
            {formatDuration(data.totalSpentSeconds || 0)}
          </span>
        </div>

        <div className="completion-stat-divider" />

        <div className="completion-stat">
          <span className="completion-stat-label">Target Hours</span>

          <span className="completion-stat-value">{(data.totalSetSeconds / 3600).toFixed(1)}h</span>
        </div>
      </div>
    </>
  );
}

function TimerBar({ popupId }) {
  return (
    <div className="completion-timer-track">
      <div
        key={popupId}
        className="completion-timer-bar"
        style={{
          animationDuration: `${AUTO_CLOSE_MS}ms`,
        }}
      />
    </div>
  );
}

function CompletionPopup({ popup, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!popup) {
      return;
    }

    const t = setTimeout(() => {
      setVisible(true);
    }, 20);

    return () => clearTimeout(t);
  }, [popup]);

  const handleClose = useCallback(() => {
    setVisible(false);

    setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    if (!popup) {
      return;
    }

    const t = setTimeout(() => {
      handleClose();
    }, AUTO_CLOSE_MS);

    return () => clearTimeout(t);
  }, [handleClose, popup]);

  if (!popup) {
    return null;
  }

  return (
    <>
      {/* Popup Backdrop */}
      <div
        className="completion-backdrop"
        style={{
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        {/* Popup Card */}
        <div
          className="completion-card"
          style={{
            transform: visible ? "scale(1) translateY(0)" : "scale(0.88) translateY(24px)",
          }}
        >
          {/* Close Button */}
          <button className="completion-close" onClick={handleClose} title="Close">
            ✕
          </button>

          {/* Animated Icon */}
          <AnimatedCheck />

          {/* Content */}
          {popup.type === "task" ? (
            <TaskCompletionContent data={popup} />
          ) : (
            <DailyCompletionContent data={popup} />
          )}

          {/* Timer Bar */}
          <TimerBar popupId={popup.id} />
        </div>
      </div>
    </>
  );
}

export default CompletionPopup;
