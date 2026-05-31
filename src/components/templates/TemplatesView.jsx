import clsx from "clsx";

import TaskList from "../task/TaskList";
import { SavedIcon } from "../../assets/icons";

function TemplatesView({ tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  return (
    <section className="space-y-5">
      {/* Create Task Button */}
      <div>
        <button
          onClick={onAddTask}
          className={clsx(
            "inline-flex cursor-pointer items-center justify-center",
            "rounded-xl px-3 py-2 sm:px-4",
            "text-[13px] font-medium sm:text-sm",
            "bg-[var(--accent)] text-white",
            "transition-all duration-200",
            "hover:-translate-y-[1px] hover:bg-[var(--accent-hover)]",
            "active:scale-[0.98]",
          )}
        >
          + Create Task
        </button>
      </div>

      {/* Task List */}
      <TaskList
        tasks={tasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        isTemplateView
        emptyIcon={<SavedIcon className="w-[32px] sm:w-[36px] lg:w-[40px]" />}
        emptyTitle="No Saved Tasks Yet"
        emptySubtitle="Hit + Create Task to build your reusable task library."
      />
    </section>
  );
}

export default TemplatesView;
