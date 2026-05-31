import TaskFlowLogo from "../../assets/logo/TaskFlowLogo";

function AppLogo({ collapsed = false, iconOnly = false, size = 34, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: iconOnly ? 0 : 10,
        minWidth: 0,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Logo Icon */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: "var(--accent-bg)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "1px solid var(--accent-border)",
          transition: "all 0.18s ease",
        }}
      >
        <TaskFlowLogo className="size-[22px] sm:size-[23px] lg:size-[24px]" />
      </div>

      {/* Brand Text */}
      {!collapsed && !iconOnly && (
        <div
          style={{
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-heading)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-h)",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
            }}
          >
            TaskFlow
          </p>

          <p
            style={{
              margin: 0,
              marginTop: 1,
              fontSize: 11,
              color: "var(--text)",
              opacity: 0.5,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
            }}
          >
            Productivity
          </p>
        </div>
      )}
    </div>
  );
}

export default AppLogo;
