import clsx from "clsx";

import TaskCard from "./TaskCard";

function TaskList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskComplete,
  onToggleTaskPin,
  onResetTaskTimer,
  isTemplateView,
  emptyIcon = "📋",
  emptyTitle = "No Tasks Found",
  emptySubtitle = "Create a new task to get started.",
}) {
  if (!tasks.length) {
    return (
      <div
        className={clsx(
          "flex min-h-[260px] items-center justify-center",
          "rounded-3xl border text-center",
          "border-[var(--border)]",
          "bg-[var(--card)]",
        )}
      >
        {/* Empty State */}
        <div className="flex flex-col items-center gap-3 px-6">
          <div className="mb-1 flex items-center justify-center text-[var(--accent)] opacity-40">
            {emptyIcon}
          </div>

          <h3 className="text-base font-semibold">{emptyTitle}</h3>

          <p className="max-w-[300px] text-sm leading-relaxed opacity-60 sm:max-w-[360px]">
            {emptySubtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {tasks.map((task) => (
        <div key={task.id} className="relative">
          <TaskCard
            task={task}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onToggleTaskComplete={onToggleTaskComplete}
            onToggleTaskPin={onToggleTaskPin}
            onResetTaskTimer={onResetTaskTimer}
            isTemplateView={isTemplateView}
          />
        </div>
      ))}
    </section>
  );
}

export default TaskList;
