import { useState, useRef } from "react";

import clsx from "clsx";

import { useTaskTimer } from "../../hooks/useTaskTimer";
import { formatTime } from "../../features/tasks/taskTime";
import { getProgress } from "../../features/tasks/taskManager";
import TaskProgress from "./TaskProgress";
import TaskTimer from "./TaskTimer";
import {
  PlayIcon,
  PauseIcon,
  ResetIcon,
  PinIcon,
  DeleteIcon,
  DropdownIcon,
  TimerIcon,
  TickIcon,
} from "../../assets/icons";

const PRIORITY_CONFIG = {
  High: {
    color: "pill-high",
    label: "High",
  },

  Medium: {
    color: "pill-medium",
    label: "Medium",
  },

  Low: {
    color: "pill-low",
    label: "Low",
  },
};

function PriorityDot({ priority }) {
  const colors = {
    High: "#ef4444",
    Medium: "#eab308",
    Low: "#22c55e",
  };

  const color = colors[priority];

  if (!color) {
    return null;
  }

  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

// Parse time input into total seconds
function parseTimeInput(raw) {
  const str = String(raw).trim();

  const parts = str.split(":").map((p) => parseInt(p, 10));

  if (parts.some(isNaN)) {
    return null;
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

// Format timestamp into DD/MM/YYYY HH:MM AM/PM
function formatDateTime(timestamp) {
  if (!timestamp) {
    return null;
  }

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

// Editable input field
function EditableField({ value, onChange, placeholder, className = "", multiline = false }) {
  const [editing, setEditing] = useState(false);

  const ref = useRef(null);

  const activate = () => {
    setEditing(true);

    setTimeout(() => {
      ref.current?.focus();
    }, 0);
  };

  const deactivate = () => setEditing(false);

  const cursorStyle = editing ? "cursor-text" : "!cursor-pointer";

  if (multiline) {
    return (
      <div className="tooltip-wrap w-full">
        <span className="tooltip">Double click to edit</span>

        <textarea
          ref={ref}
          value={value || ""}
          placeholder={placeholder}
          readOnly={!editing}
          rows={1}
          title=""
          onDoubleClick={activate}
          onBlur={deactivate}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "editable-field w-full resize-none bg-transparent",
            "text-sm opacity-70",
            "outline-none transition-all duration-150",
            editing && "editing",
            cursorStyle,
            className,
          )}
        />
      </div>
    );
  }

  return (
    <div className="tooltip-wrap w-full">
      <span className="tooltip">Double click to edit</span>

      <input
        ref={ref}
        type="text"
        value={value || ""}
        placeholder={placeholder}
        readOnly={!editing}
        title=""
        onDoubleClick={activate}
        onBlur={deactivate}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "editable-field w-full bg-transparent",
          "outline-none transition-all duration-150",
          editing && "editing",
          cursorStyle,
          className,
        )}
      />
    </div>
  );
}

// Priority dropdown
function PrioritySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  const handleBlur = (e) => {
    if (!ref.current?.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  const cfg = PRIORITY_CONFIG[value];

  return (
    <div ref={ref} className="relative" onBlur={handleBlur}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={clsx(
          "pill w-full cursor-pointer justify-center",
          "transition-all hover:opacity-80",
          cfg ? cfg.color : "border border-[var(--border)] bg-[var(--card)] text-[var(--text)]",
        )}
      >
        {cfg ? (
          <>
            <PriorityDot priority={value} />

            <span>{cfg.label}</span>
          </>
        ) : (
          <span className="flex flex-row gap-2 opacity-50">
            Priority
            <DropdownIcon className="w-[8px] stroke-2 sm:w-[9px] lg:w-[10px]" />
          </span>
        )}
      </button>

      {open && (
        <div
          className={clsx(
            "absolute top-[calc(100%+4px)] left-0 z-30",
            "w-[140px] overflow-hidden rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
            "shadow-lg",
          )}
        >
          {["High", "Medium", "Low"].map((p) => {
            return (
              <button
                key={p}
                tabIndex={0}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={clsx(
                  "flex w-full items-center gap-2",
                  "px-3 py-2 text-sm",
                  "transition-colors hover:bg-[var(--accent-bg)]",
                  value === p && "bg-[var(--accent-bg)]",
                )}
              >
                <PriorityDot priority={p} />

                <span
                  className={clsx(
                    "font-medium",
                    p === "High"
                      ? "text-orange-500"
                      : p === "Medium"
                        ? "text-yellow-500"
                        : "text-green-500",
                  )}
                >
                  {p}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm opacity-50 hover:bg-[var(--accent-bg)]"
          >
            <span>None</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Icon button with custom tooltip
function IconBtn({ onClick, title, children, danger = false, active = false }) {
  return (
    <div className="tooltip-wrap">
      <span className="tooltip">{title}</span>

      <button
        onClick={onClick}
        title=""
        className={clsx(
          "icon-btn cursor-pointer",
          danger && "danger",
          active && "!border-[var(--accent)] !bg-[var(--accent)] text-white",
        )}
      >
        {children}
      </button>
    </div>
  );
}

// Editable target time pill
function EditableTimePill({ value, onChange }) {
  const [editing, setEditing] = useState(false);

  const ref = useRef(null);

  const activate = () => {
    setEditing(true);

    setTimeout(() => {
      ref.current?.focus();
    }, 0);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        type="number"
        value={value || ""}
        placeholder="Min"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className="pill pill-time w-[80px] cursor-text text-center outline-none"
        style={{
          border: "1.5px solid var(--accent)",
        }}
      />
    );
  }

  return (
    <div className="tooltip-wrap">
      <span className="tooltip">Double click to edit minutes</span>

      <button
        onDoubleClick={activate}
        title=""
        className="pill pill-time cursor-pointer transition-opacity hover:opacity-80"
      >
        <TimerIcon />

        {value ? `${value} min` : "Set time"}
      </button>
    </div>
  );
}

// Editable timer display
function EditableTimer({ value, onSave }) {
  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState(value);

  const ref = useRef(null);

  const activate = () => {
    setDraft(value);

    setEditing(true);

    setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 0);
  };

  const commit = () => {
    const total = parseTimeInput(draft);

    if (total !== null && total >= 0) {
      onSave(total);
    }

    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      commit();
    }

    if (e.key === "Escape") {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="tooltip-wrap">
        <span className="tooltip">HH:MM:SS · MM:SS · seconds</span>

        <input
          ref={ref}
          value={draft}
          title=""
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          className={clsx(
            "rounded-lg border px-2",
            "border-[var(--accent)]",
            "bg-[var(--accent-bg)]",
            "text-center outline-none",
          )}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
            color: "var(--accent)",
            width: 110,
            height: 32,
          }}
        />
      </div>
    );
  }

  return (
    <div className="tooltip-wrap">
      <span className="tooltip">Double click to edit time</span>

      <TaskTimer value={value} onDoubleClick={activate} />
    </div>
  );
}

function TaskCard({
  task,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskComplete,
  onToggleTaskPin,
  onResetTaskTimer,
  isTemplateView,
}) {
  const { time, isRunning, toggleTimer, forceStop, setManualTime } = useTaskTimer(
    task,
    onUpdateTask,
    isTemplateView,
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const spentSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;

  const progress = getProgress(parseInt(task.setTaskHours || 0), spentSeconds);

  const update = (field) => (val) =>
    onUpdateTask(task.id, {
      [field]: val,
    });

  // Stop timer if task is marked complete while running
  const handleToggleComplete = (e) => {
    const checked = e.target.checked;

    if (checked && isRunning) {
      forceStop();
    }

    onToggleTaskComplete?.(task.id, checked);
  };

  const startLabel = formatDateTime(task.createdAt);

  const completedLabel =
    task.checkboxState && task.completedAt ? formatDateTime(task.completedAt) : null;

  return (
    <article className="task-card relative flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <EditableField
            value={task.editTaskName}
            onChange={update("editTaskName")}
            placeholder="Task name..."
            className="mb-1 text-lg font-semibold text-[var(--text-h)]"
          />

          <EditableField
            value={task.editTaskDetails}
            onChange={update("editTaskDetails")}
            placeholder="Add details..."
          />
        </div>

        {/* Complete Checkbox */}
        <div className="tooltip-wrap shrink-0">
          <span className="tooltip">
            {task.checkboxState ? "Mark as open" : "Mark as complete"}
          </span>

          <label className="custom-checkbox cursor-pointer">
            <input
              type="checkbox"
              checked={task.checkboxState || false}
              onChange={handleToggleComplete}
            />

            <span />
          </label>
        </div>
      </div>

      {/* Task Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <PrioritySelect
          value={task.selectPriority || ""}
          onChange={(v) =>
            onUpdateTask(task.id, {
              selectPriority: v,
            })
          }
        />

        <EditableTimePill value={task.setTaskHours} onChange={update("setTaskHours")} />

        <TaskProgress progress={progress} />
      </div>

      {/* Timer Controls */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-1">
        {/* Timer */}
        <div className="flex flex-row flex-nowrap items-center gap-3">
          <EditableTimer
            value={formatTime(time.hours, time.minutes, time.seconds)}
            onSave={setManualTime}
          />

          {!isTemplateView && (
            <IconBtn
              onClick={toggleTimer}
              title={isRunning ? "Pause timer" : "Start timer"}
              active={isRunning}
            >
              {isRunning ? (
                <PauseIcon className="w-[14px] text-white sm:w-[15px] lg:w-[16px]" />
              ) : (
                <PlayIcon className="w-[14px] sm:w-[15px] lg:w-[16px]" />
              )}
            </IconBtn>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row flex-nowrap items-center gap-3">
          {!isTemplateView && (
            <IconBtn onClick={() => onResetTaskTimer?.(task.id)} title="Reset timer">
              <ResetIcon className="w-[14px] stroke-2 sm:w-[15px] lg:w-[16px]" />
            </IconBtn>
          )}

          {!isTemplateView && !task.checkboxState && (
            <IconBtn
              onClick={() => onToggleTaskPin?.(task.id)}
              title={task.isPinned ? "Unpin task" : "Pin task"}
              active={!!task.isPinned}
            >
              <PinIcon
                className={clsx(
                  "w-[14px] stroke-2 sm:w-[15px] lg:w-[16px]",
                  task.isPinned && "text-white",
                )}
              />
            </IconBtn>
          )}

          <IconBtn onClick={() => setShowDeleteConfirm(true)} title="Delete task" danger>
            <DeleteIcon className="w-[14px] sm:w-[15px] lg:w-[16px]" />
          </IconBtn>
        </div>
      </div>

      {/* Date Metadata */}
      <div
        className={clsx(
          "flex flex-row flex-wrap items-center",
          "gap-x-3 gap-y-0.5",
          "border-t border-[var(--border)] pt-1",
          "text-xs opacity-50",
        )}
      >
        {/* Created Timestamp */}
        <span>{startLabel}</span>

        {/* Completed Timestamp */}
        {completedLabel && (
          <span className="flex items-center gap-1 text-green-500 opacity-100">
            <TickIcon className="w-[8px] stroke-2 sm:w-[9px] lg:w-[10px]" />

            {completedLabel}
          </span>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div
          className={clsx(
            "absolute inset-0 z-20",
            "flex flex-col items-center justify-center",
            "rounded-[18px] border border-red-500/20",
            "bg-[var(--card)]/95",
            "px-5 backdrop-blur-sm",
          )}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-semibold text-[var(--text-h)]">Delete this task?</p>

            <p className="text-xs opacity-50">This cannot be undone.</p>

            {/* Confirmation Buttons */}
            <div className="mt-2 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn px-5 text-sm">
                Cancel
              </button>

              <button
                onClick={() => {
                  onDeleteTask(task.id);

                  setShowDeleteConfirm(false);
                }}
                className={clsx(
                  "rounded-xl px-5 py-2",
                  "bg-red-500",
                  "text-sm font-medium text-white",
                  "transition-colors hover:bg-red-600",
                )}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default TaskCard;
