import { useState, useRef, useEffect } from "react";

import clsx from "clsx";

import { CalendarIcon, DropdownIcon } from "../../assets/icons";

const QUICK_RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom Range" },
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getRangeLabel(range, start, end) {
  if (range === "custom" && start) {
    const fmt = (d) =>
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });

    return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
  }

  return QUICK_RANGES.find((r) => r.key === range)?.label || "Date Range";
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  return cells;
}

const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString();

const isInRange = (d, s, e) =>
  d && s && e && d.getTime() > s.getTime() && d.getTime() < e.getTime();

function DateRangeFilter({ range, setRange, customDates, setCustomDates }) {
  const [open, setOpen] = useState(false);

  const [dropPos, setDropPos] = useState({
    top: 0,
    left: 0,
  });

  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const [hoverDate, setHoverDate] = useState(null);

  const btnRef = useRef(null);

  const customStart = customDates?.start || null;

  const customEnd = customDates?.end || null;

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      const portal = document.getElementById("drp-portal");

      const clickedOutsideButton = !btnRef.current?.contains(e.target);

      const clickedOutsidePortal = !portal?.contains(e.target);

      if (clickedOutsideButton && clickedOutsidePortal) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  // Use fixed positioning so dropdown ignores parent overflow clipping
  const handleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();

      const dropW = 500;

      const spaceRight = window.innerWidth - rect.left;

      const left = spaceRight >= dropW + 8 ? rect.left : Math.max(8, rect.right - dropW);

      setDropPos({
        top: rect.bottom + 6,
        left,
      });
    }

    setOpen((p) => !p);
  };

  const selectQuick = (key) => {
    if (key !== "custom") {
      setRange(key);

      setCustomDates?.({
        start: null,
        end: null,
      });

      setOpen(false);

      return;
    }

    setRange("custom");

    setCustomDates?.({
      start: null,
      end: null,
    });
  };

  const selectDay = (date) => {
    if (!date) return;

    if (!customStart || (customStart && customEnd)) {
      setCustomDates?.({
        start: date,
        end: null,
      });

      return;
    }

    setCustomDates?.(
      date < customStart
        ? {
          start: date,
          end: customStart,
        }
        : {
          start: customStart,
          end: date,
        },
    );
  };

  const applyCustom = () => {
    if (customStart) {
      setRange("custom");
      setOpen(false);
    }
  };

  const prevMonth = () =>
    calMonth === 0 ? (setCalYear((y) => y - 1), setCalMonth(11)) : setCalMonth((m) => m - 1);

  const nextMonth = () =>
    calMonth === 11 ? (setCalYear((y) => y + 1), setCalMonth(0)) : setCalMonth((m) => m + 1);

  const cells = buildCalendar(calYear, calMonth);

  const displayEnd = customEnd || hoverDate;

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={btnRef}
        onClick={handleOpen}
        className={clsx(
          "inline-flex cursor-pointer items-center gap-2",
          "rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]",
          "px-3 py-2 sm:px-4",
          "text-sm font-medium",
          "transition-all",
          "hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)]",
        )}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
        }}
      >
        <CalendarIcon className="size-[14px] stroke-2 sm:size-[15px] lg:size-[16px]" />

        <span>{getRangeLabel(range, customStart, customEnd)}</span>

        <span className="text-[11px] opacity-40">
          <DropdownIcon className="w-[8px] sm:w-[10px] lg:w-[12px]" />
        </span>
      </button>

      {/* Dropdown Portal */}
      {open && (
        <div
          id="drp-portal"
          className={clsx(
            "fixed z-[9999]",
            "flex overflow-hidden",
            "rounded-[18px]",
            "border border-[var(--border)]",
            "bg-[var(--card)]",
          )}
          style={{
            top: dropPos.top,
            left: dropPos.left,
            width: 500,
            maxWidth: "calc(100vw - 16px)",
            fontFamily: "var(--font-sans)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Quick Range Sidebar */}
          <div
            className={clsx("w-[145px] shrink-0", "border-r border-[var(--border)]", "px-2 py-3")}
          >
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] opacity-40">
              Quick Select
            </p>

            {QUICK_RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => selectQuick(r.key)}
                className="mb-[1px] block w-full rounded-lg px-[10px] py-[7px] text-left text-[13px] transition-all"
                style={{
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontWeight: range === r.key ? 600 : 400,
                  background: range === r.key ? "var(--accent)" : "transparent",
                  color: range === r.key ? "#fff" : "var(--text)",
                }}
                onMouseEnter={(e) => {
                  if (range !== r.key) {
                    e.target.style.background = "var(--accent-bg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (range !== r.key) {
                    e.target.style.background = "transparent";
                  }
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Calendar Panel */}
          <div className="min-w-0 flex-1 p-4">
            {/* Month Navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button onClick={prevMonth} className="icon-btn" title="Prev month">
                ‹
              </button>

              <span className="text-[13px] font-semibold text-[var(--text-h)]">
                {MONTHS[calMonth]} {calYear}
              </span>

              <button onClick={nextMonth} className="icon-btn" title="Next month">
                ›
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="mb-1 grid grid-cols-7">
              {DAYS.map((d) => (
                <div key={d} className="pb-1 text-center text-[11px] font-semibold opacity-40">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-y-[2px]">
              {cells.map((date, i) => {
                if (!date) {
                  return <div key={`e${i}`} />;
                }

                const isStart = isSameDay(date, customStart);

                const isEnd = isSameDay(date, displayEnd);

                const inRange = isInRange(date, customStart, displayEnd);

                const isToday = isSameDay(date, new Date());

                const isFuture = date > new Date();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => !isFuture && selectDay(date)}
                    onMouseEnter={() => {
                      if (customStart && !customEnd && !isFuture) {
                        setHoverDate(date);
                      }
                    }}
                    onMouseLeave={() => setHoverDate(null)}
                    className="rounded-[7px] border-none px-[2px] py-[6px] text-center text-[12px]"
                    style={{
                      cursor: isFuture ? "not-allowed" : "pointer",
                      opacity: isFuture ? 0.25 : 1,
                      fontWeight: isStart || isEnd || isToday ? 700 : 400,
                      background:
                        isStart || isEnd
                          ? "var(--accent)"
                          : inRange
                            ? "var(--accent-bg)"
                            : "transparent",
                      color:
                        isStart || isEnd
                          ? "#fff"
                          : inRange
                            ? "var(--accent)"
                            : isToday
                              ? "var(--accent)"
                              : "var(--text-h)",
                      transition: "background 0.1s",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Apply Section */}
            <div
              className={clsx(
                "mt-[14px]",
                "flex items-center justify-between",
                "border-t border-[var(--border)]",
                "pt-3",
              )}
            >
              <span className="text-[11.5px] text-[var(--text)] opacity-50">
                {customStart && customEnd
                  ? `${customStart.toLocaleDateString()} – ${customEnd.toLocaleDateString()}`
                  : customStart
                    ? "Pick end date…"
                    : "Pick start date"}
              </span>

              <button
                onClick={applyCustom}
                disabled={!customStart}
                className="rounded-lg px-[14px] py-[5px] text-[12.5px] font-semibold"
                style={{
                  border: "none",
                  cursor: customStart ? "pointer" : "not-allowed",
                  background: customStart ? "var(--accent)" : "var(--border)",
                  color: customStart ? "#fff" : "var(--text)",
                  opacity: customStart ? 1 : 0.5,
                  fontFamily: "var(--font-sans)",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DateRangeFilter;
