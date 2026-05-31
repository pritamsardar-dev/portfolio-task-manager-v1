import { useState } from "react";

import clsx from "clsx";

import DeleteTaskModal from "./DeleteTaskModal";

function TaskActions({ onStartPause, onReset, onDelete, isRunning, isTemplateView }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Timer Controls */}
        {!isTemplateView && (
          <>
            <button
              onClick={onStartPause}
              className={clsx(
                "rounded-xl px-4 py-2",
                "bg-[var(--accent)]",
                "text-sm text-white",
                "transition-all duration-200 hover:-translate-y-[1px]",
              )}
            >
              {isRunning ? "Pause" : "Start"}
            </button>

            <button onClick={onReset} className="btn">
              Reset
            </button>
          </>
        )}

        {/* Delete Button */}
        <button
          onClick={() => setShowDelete(true)}
          className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          onDelete();
          setShowDelete(false);
        }}
      />
    </>
  );
}

export default TaskActions;
