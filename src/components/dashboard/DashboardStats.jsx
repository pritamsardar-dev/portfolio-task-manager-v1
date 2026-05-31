import clsx from "clsx";

import { calculateDashboardStats } from "../../features/dashboard/dashboardController";

function StatCard({ label, value }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-3",
        "bg-[var(--card)]",
        "border-[var(--border)]",
        "sm:p-4",
      )}
      style={{ flex: "1 1 0", minWidth: 0 }}
    >
      {/* Card Label */}
      <p className="mb-1.5 truncate text-xs opacity-70 sm:text-sm">{label}</p>

      {/* Value Badge */}
      <div
        className={clsx(
          "inline-flex rounded-full",
          "px-2 py-1",
          "text-xs font-medium whitespace-nowrap",
          "bg-[var(--accent-bg)]",
          "text-[var(--accent)]",
          "sm:px-4 sm:py-2 sm:text-sm",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function DashboardStats({ tasks }) {
  const stats = calculateDashboardStats(tasks);

  return (
    <section className="mb-4 flex flex-nowrap gap-2 sm:grid sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
      <StatCard label="Total Tasks" value={`${stats.totalTasks} tasks`} />

      <StatCard label="Total Hours" value={`${(stats.totalSetSeconds / 3600).toFixed(2)}h`} />

      <StatCard label="Hours Spent" value={`${(stats.totalSpentSeconds / 3600).toFixed(2)}h`} />

      {/* Productivity Card */}
      <div
        className={clsx(
          "rounded-2xl border p-3",
          "bg-[var(--card)]",
          "border-[var(--border)]",
          "sm:p-4",
        )}
        style={{ flex: "1 1 0", minWidth: 0 }}
      >
        {/* Productivity Label */}
        <p className="mb-1.5 truncate text-xs opacity-70 sm:mb-3 sm:text-sm">Productivity</p>

        {/* Progress Track */}
        <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-black/10 sm:mb-2 sm:h-2.5">
          {/* Progress Fill */}
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${stats.productivity}%` }}
          />
        </div>

        {/* Productivity Value */}
        <p className="text-xs font-medium text-[var(--accent)] sm:text-sm">
          {stats.productivity.toFixed(0)}%
        </p>
      </div>
    </section>
  );
}

export default DashboardStats;
