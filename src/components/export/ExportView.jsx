import { useMemo, useState } from "react";

import clsx from "clsx";

import { ExportIcon, TasksIcon } from "../../assets/icons";
import { exportTasksAsCsv, exportTasksAsJson } from "../../utils/exportData";
import DashboardStats from "../dashboard/DashboardStats";
import DateRangeFilter from "../layout/DateRangeFilter";
import Pagination from "../layout/Pagination";

const TASKS_PER_PAGE = 12;

function formatFullDateTime(timestamp) {
  if (!timestamp) return null;

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

// Priority color map
const PRIORITY_STYLES = {
  High: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  Low: "bg-green-500/10 text-green-600 border border-green-500/20",
};

function PriorityBadge({ priority }) {
  if (!priority) {
    return <span className="text-sm opacity-40">—</span>;
  }

  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2 py-1",
        "text-xs font-medium",
        PRIORITY_STYLES[priority] || "",
      )}
    >
      {priority}
    </span>
  );
}

function ExportView({ tasks, range, setRange, customDates, setCustomDates }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);

  const paginatedTasks = useMemo(() => {
    return tasks.slice((currentPage - 1) * TASKS_PER_PAGE, currentPage * TASKS_PER_PAGE);
  }, [tasks, currentPage]);

  return (
    <section className="space-y-5">
      {/* Export Actions */}
      <div className="mb-5 flex flex-wrap items-center gap-2 sm:gap-2.5">
        <button
          onClick={() => exportTasksAsCsv(tasks, "task-data")}
          className={clsx(
            "inline-flex cursor-pointer items-center justify-center gap-2",
            "rounded-xl px-3 py-2 sm:px-4",
            "text-[13px] font-medium text-white sm:text-sm",
            "bg-[var(--accent)]",
            "select-none transition-all duration-200",
            "hover:-translate-y-[1px] hover:bg-[var(--accent-hover)]",
            "active:scale-[0.98]",
          )}
        >
          <ExportIcon className="size-[13px] shrink-0 sm:size-[14px] lg:size-[15px]" />
          <span className="whitespace-nowrap">Export Excel CSV</span>
        </button>

        <button
          onClick={() => exportTasksAsJson(tasks, "task-data")}
          className={clsx(
            "inline-flex cursor-pointer items-center justify-center gap-2",
            "rounded-xl border px-3 py-2 sm:px-4",
            "text-[13px] font-medium sm:text-sm",
            "bg-[var(--card)]",
            "border-[var(--border)]",
            "text-[var(--text-h)]",
            "select-none transition-all duration-200",
            "hover:-translate-y-[1px]",
            "hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]",
            "active:scale-[0.98]",
          )}
        >
          <TasksIcon className="size-[12px] shrink-0 sm:size-[13px] lg:size-[14px]" />
          <span className="whitespace-nowrap">Export JSON</span>
        </button>

        {/* Date Range Filter */}
        <DateRangeFilter
          range={range}
          setRange={setRange}
          customDates={customDates}
          setCustomDates={setCustomDates}
        />
      </div>

      {/* Dashboard Stats */}
      <DashboardStats tasks={tasks} />

      {/* Preview Table */}
      <div className={clsx("rounded-3xl border p-5", "bg-[var(--card)]", "border-[var(--border)]")}>
        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] border-collapse">
            <thead>
              <tr>
                {[
                  "Task",
                  "Details",
                  "Priority",
                  "Minutes",
                  "Spent",
                  "Status",
                  "Created",
                  "Completed",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-[var(--border)] px-4 py-3 text-left text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedTasks.map((task) => {
                const createdLabel = formatFullDateTime(task.createdAt);

                const completedLabel =
                  task.checkboxState && task.completedAt
                    ? formatFullDateTime(task.completedAt)
                    : null;

                return (
                  <tr
                    key={task.id}
                    className="border-b border-[var(--border)] transition-colors hover:bg-[var(--accent-bg)]"
                  >
                    <td className="px-4 py-3 text-sm">{task.editTaskName}</td>

                    <td className="px-4 py-3 text-sm opacity-70">{task.editTaskDetails}</td>

                    <td className="px-4 py-3">
                      <PriorityBadge priority={task.selectPriority} />
                    </td>

                    <td className="px-4 py-3 text-sm">{task.setTaskHours}</td>

                    <td className="px-4 py-3 text-sm">
                      {((task.spentTaskHours || 0) / 3600).toFixed(2)}h
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-flex rounded-full px-2 py-1",
                          "text-xs font-medium",
                          task.checkboxState
                            ? "border border-green-500/20 bg-green-500/10 text-green-600"
                            : "border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]",
                        )}
                      >
                        {task.checkboxState ? "Done" : "Open"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm opacity-70">{createdLabel}</td>

                    <td className="px-4 py-3 text-sm">
                      {completedLabel ? (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ {completedLabel}
                        </span>
                      ) : (
                        <span className="opacity-30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedTasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm opacity-40">
                    No tasks in selected range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-5 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default ExportView;
