import clsx from "clsx";

// Progress fill is driven by inline style since it depends on a dynamic value
function TaskProgress({ progress }) {
  return (
    <div
      className={clsx("pill relative overflow-hidden", "justify-center")}
      style={{
        background: `
          linear-gradient(
            90deg,
            rgba(139,43,226,0.15) ${progress}%,
            transparent ${progress}%
          )
        `,
        border: "1px solid var(--accent-border)",
        color: "var(--accent)",
        minWidth: "80px",
      }}
    >
      <span className="font-semibold">{progress.toFixed(0)}%</span>
    </div>
  );
}

export default TaskProgress;
