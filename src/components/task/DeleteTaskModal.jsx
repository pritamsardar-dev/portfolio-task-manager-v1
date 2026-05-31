import clsx from "clsx";

function DeleteTaskModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={clsx("fixed inset-0 z-50", "flex items-center justify-center", "bg-black/40 px-4")}
    >
      <div
        className={clsx(
          "w-full max-w-sm",
          "rounded-3xl border p-6",
          "bg-[var(--card)]",
          "border-[var(--border)]",
        )}
      >
        {/* Heading */}
        <div className="mb-5">
          <h2 className="mb-2 text-xl">Delete Task</h2>
          <p className="text-sm opacity-70">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn border-red-500 text-red-500">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTaskModal;
