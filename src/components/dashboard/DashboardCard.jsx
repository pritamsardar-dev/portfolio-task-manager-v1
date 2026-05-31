import clsx from "clsx";

function DashboardCard({ label, value }) {
  return (
    <div className={clsx("rounded-2xl border p-4", "bg-[var(--card)]", "border-[var(--border)]")}>
      {/* Card Label */}
      <p className="mb-2 text-sm opacity-70">{label}</p>

      {/* Value Badge */}
      <div
        className={clsx(
          "inline-flex rounded-full px-4 py-2",
          "text-sm font-medium",
          "bg-[var(--accent-bg)]",
          "text-[var(--accent)]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export default DashboardCard;
