// Pure display component for timer text
function TaskTimer({ value, onDoubleClick }) {
  return (
    <p
      onDoubleClick={onDoubleClick}
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontVariantNumeric: "tabular-nums",
        color: "var(--text-h)",
        margin: 0,
        // Text cursor signals the timer is double-click editable
        cursor: onDoubleClick ? "text" : "default",
      }}
    >
      {value}
    </p>
  );
}

export default TaskTimer;
