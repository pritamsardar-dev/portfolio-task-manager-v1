import { useMemo, useState } from "react";

import clsx from "clsx";

import { formatGraphDate } from "../../utils/dateRange";
import { getDailyTimeMap, getDateKey } from "../../utils/dailyTimeStorage";
import DashboardStats from "./DashboardStats";
import DateRangeFilter from "../layout/DateRangeFilter";

// Groups tasks by calendar day and computes spent vs target hours
function buildDailyPoints(tasks) {
  const map = {};

  for (const task of tasks) {
    const d = new Date(task.createdAt);

    // Midnight timestamp as stable day key
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    if (!map[key]) {
      map[key] = {
        date: key,
        spent: 0,
        target: 0,
        count: 0,
      };
    }

    // spentTaskHours is stored in seconds
    map[key].spent += task.spentTaskHours || 0;

    // setTaskHours is in minutes, convert to seconds
    map[key].target += parseInt(task.setTaskHours || "0", 10) * 60;

    map[key].count += 1;
  }

  return Object.values(map)
    .sort((a, b) => a.date - b.date)
    .map((d) => ({
      date: d.date,
      count: d.count,

      // Productivity capped at 100 percent
      productivity: d.target > 0 ? Math.min((d.spent / d.target) * 100, 100) : 0,

      hoursSpent: (d.spent / 3600).toFixed(2),
    }));
}

// Productivity curve SVG chart
function ProductivityChart({ points }) {
  const W = 600;
  const H = 180;

  const PAD_LEFT = 36;
  const PAD_RIGHT = 16;
  const PAD_TOP = 16;
  const PAD_BOT = 32;

  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOT;

  if (points.length === 0) {
    return (
      <div
        style={{
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <p style={{ fontSize: 13 }}>No data for selected range</p>
      </div>
    );
  }

  // Map points to SVG coordinates
  const coords = points.map((p, i) => ({
    x: PAD_LEFT + (points.length === 1 ? chartW / 2 : (i / (points.length - 1)) * chartW),
    y: PAD_TOP + chartH - (p.productivity / 100) * chartH,
    ...p,
  }));

  // Smooth bezier path through all points
  function smoothPath(pts) {
    if (pts.length === 1) {
      return `
        M ${pts[0].x - 20} ${pts[0].y}
        L ${pts[0].x + 20} ${pts[0].y}
      `;
    }

    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
      const cp1y = pts[i].y;

      const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
      const cp2y = pts[i + 1].y;

      d += `
        C ${cp1x} ${cp1y},
        ${cp2x} ${cp2y},
        ${pts[i + 1].x} ${pts[i + 1].y}
      `;
    }

    return d;
  }

  const linePath = smoothPath(coords);

  const firstX = coords[0].x;
  const lastX = coords[coords.length - 1].x;
  const baseY = PAD_TOP + chartH;

  const fillPath = `
    ${linePath}
    L ${lastX} ${baseY}
    L ${firstX} ${baseY}
    Z
  `;

  const yLabels = [
    { pct: 100, y: PAD_TOP },
    { pct: 50, y: PAD_TOP + chartH / 2 },
    { pct: 0, y: PAD_TOP + chartH },
  ];

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          minWidth: 280,
          height: "auto",
          display: "block",
        }}
        aria-label="Productivity curve"
      >
        <defs>
          <linearGradient id="prodFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.01" />
          </linearGradient>

          <clipPath id="chartClip">
            <rect x={PAD_LEFT} y={PAD_TOP} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {/* Grid Lines */}
        {yLabels.map(({ pct, y }) => (
          <g key={pct}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={PAD_LEFT + chartW}
              y2={y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray={pct === 0 || pct === 100 ? "none" : "4 4"}
            />

            <text
              x={PAD_LEFT - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text)"
              opacity="0.5"
            >
              {pct}%
            </text>
          </g>
        ))}

        {/* Fill Area */}
        <path d={fillPath} fill="url(#prodFill)" clipPath="url(#chartClip)" />

        {/* Curve Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#chartClip)"
        />

        {/* Data Points */}
        {coords.map((pt, i) => (
          <g key={`${pt.date}-${i}`}>
            <circle cx={pt.x} cy={pt.y} r="12" fill="transparent">
              <title>
                {`
                  ${formatGraphDate(pt.date)}:
                  ${pt.productivity.toFixed(0)}%
                  (${pt.hoursSpent}h · ${pt.count} task${pt.count !== 1 ? "s" : ""})
                `}
              </title>
            </circle>

            <circle
              cx={pt.x}
              cy={pt.y}
              r="4"
              fill="var(--card)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          </g>
        ))}

        {/* X Axis Labels */}
        {coords
          .filter((_, i) => {
            if (coords.length <= 7) return true;
            if (i === 0 || i === coords.length - 1) return true;
            return i % Math.ceil(coords.length / 6) === 0;
          })
          .map((pt, i) => (
            <text
              key={`${pt.date}-label-${i}`}
              x={pt.x}
              y={H - 6}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text)"
              opacity="0.55"
            >
              {formatGraphDate(pt.date)}
            </text>
          ))}
      </svg>
    </div>
  );
}

// Returns color tokens based on hours worked that day
function getDayColor(hours) {
  if (hours === 0) {
    return {
      bg: "rgba(239,68,68,0.07)",
      border: "rgba(239,68,68,0.18)",
      text: "rgba(220,38,38,0.60)",
      label: "rgba(220,38,38,0.38)",
    };
  }

  if (hours < 0.5) {
    return {
      bg: "rgba(249,115,22,0.07)",
      border: "rgba(249,115,22,0.18)",
      text: "rgba(234,88,12,0.62)",
      label: "rgba(234,88,12,0.40)",
    };
  }

  if (hours < 1.5) {
    return {
      bg: "rgba(251,191,36,0.07)",
      border: "rgba(251,191,36,0.18)",
      text: "rgba(202,138,4,0.68)",
      label: "rgba(202,138,4,0.42)",
    };
  }

  if (hours < 3) {
    return {
      bg: "rgba(163,230,53,0.07)",
      border: "rgba(163,230,53,0.18)",
      text: "rgba(101,163,13,0.68)",
      label: "rgba(101,163,13,0.42)",
    };
  }

  if (hours < 5) {
    return {
      bg: "rgba(74,222,128,0.08)",
      border: "rgba(74,222,128,0.20)",
      text: "rgba(22,163,74,0.68)",
      label: "rgba(22,163,74,0.44)",
    };
  }

  if (hours < 7) {
    return {
      bg: "rgba(52,211,153,0.09)",
      border: "rgba(52,211,153,0.21)",
      text: "rgba(13,148,136,0.70)",
      label: "rgba(13,148,136,0.46)",
    };
  }

  if (hours < 9) {
    return {
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.23)",
      text: "rgba(5,150,105,0.72)",
      label: "rgba(5,150,105,0.48)",
    };
  }

  return {
    bg: "rgba(5,150,105,0.11)",
    border: "rgba(5,150,105,0.26)",
    text: "rgba(4,120,87,0.78)",
    label: "rgba(4,120,87,0.52)",
  };
}

function formatCardDate(date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatCardDay(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
  });
}

const CARDS_PER_PAGE = 30;

function DailyHoursBlock({ range, customDates, tasks }) {
  const [page, setPage] = useState(1);

  const dailyMap = useMemo(() => getDailyTimeMap(), []);

  const dates = useMemo(() => {
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const todayStart = startOfDay(new Date());

    let startDate;
    let endDate = todayStart;

    if (range === "today") {
      startDate = todayStart;
    } else if (range === "yesterday") {
      const y = new Date(todayStart);
      y.setDate(y.getDate() - 1);
      startDate = y;
      endDate = y;
    } else if (range === "week") {
      startDate = new Date(todayStart);
      startDate.setDate(startDate.getDate() - 6);
    } else if (range === "month") {
      startDate = new Date(todayStart);
      startDate.setDate(startDate.getDate() - 29);
    } else if (range === "custom" && customDates?.start) {
      startDate = startOfDay(customDates.start);
      endDate = customDates.end ? startOfDay(customDates.end) : todayStart;
    } else {
      let earliest = todayStart;

      if (tasks.length > 0) {
        const minTs = Math.min(...tasks.map((t) => t.createdAt));
        const fromTasks = startOfDay(new Date(minTs));
        if (fromTasks < earliest) earliest = fromTasks;
      }

      const mapKeys = Object.keys(dailyMap);

      if (mapKeys.length > 0) {
        const minMapTs = Math.min(...mapKeys.map((k) => new Date(k).getTime()));
        if (!isNaN(minMapTs)) {
          const fromMap = startOfDay(new Date(minMapTs));
          if (fromMap < earliest) earliest = fromMap;
        }
      }

      startDate = earliest;
    }

    const result = [];
    const cursor = new Date(endDate);

    while (cursor >= startDate) {
      result.push(new Date(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }

    return result;
  }, [range, customDates, tasks, dailyMap]);

  // Reset page when filters change
  const [prevRange, setPrevRange] = useState(range);
  const [prevCustomDates, setPrevCustomDates] = useState(customDates);

  if (
    prevRange !== range ||
    prevCustomDates?.start !== customDates?.start ||
    prevCustomDates?.end !== customDates?.end
  ) {
    setPrevRange(range);
    setPrevCustomDates(customDates);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(dates.length / CARDS_PER_PAGE));
  const paginatedDates = dates.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const pageBtnBase = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text-h)",
    fontSize: 16,
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    transition: "all 0.15s ease",
    flexShrink: 0,
  };

  const isOnlyOnePage = totalPages <= 1;

  return (
    <div className={clsx("rounded-3xl border p-6", "bg-[var(--card)]", "border-[var(--border)]")}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Title */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-h)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Daily Hours
          </h3>

          <p
            style={{
              fontSize: 13,
              opacity: 0.55,
              marginTop: 4,
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Time worked per calendar day
          </p>
        </div>

        {/* Pagination */}
        {!isOnlyOnePage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                ...pageBtnBase,
                opacity: page === 1 ? 0.32 : 1,
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M8 2.5L4.5 6.5L8 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <span
              style={{
                fontSize: 11.5,
                opacity: 0.55,
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                ...pageBtnBase,
                opacity: page === totalPages ? 0.32 : 1,
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M5 2.5L8.5 6.5L5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Day Cards */}
      {paginatedDates.length === 0 ? (
        <div
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.38,
            fontSize: 13,
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
          }}
        >
          No data for selected range
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {paginatedDates.map((date) => {
            const key = getDateKey(date);
            const seconds = dailyMap[key] || 0;
            const hours = seconds / 3600;
            const color = getDayColor(hours);
            const isToday = key === getDateKey(new Date());

            return (
              <div
                key={key}
                style={{
                  background: color.bg,
                  border: `1px solid ${isToday ? "var(--accent-border)" : color.border}`,
                  borderRadius: 10,
                  padding: "7px 10px 6px",
                  minWidth: 68,
                  textAlign: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {/* Today Indicator */}
                {isToday && (
                  <span
                    style={{
                      position: "absolute",
                      top: 5,
                      right: 5,
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      opacity: 0.7,
                    }}
                  />
                )}

                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    color: color.text,
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {hours >= 0.05 ? `${hours.toFixed(1)}h` : "0h"}
                </p>

                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 9,
                    fontWeight: 600,
                    color: color.label,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {formatCardDay(date)}
                </p>

                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 10,
                    color: color.label,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCardDate(date)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Color Legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 10.5, opacity: 0.4 }}>0h</span>

        {[0, 0.5, 1.5, 3, 5, 7, 9].map((h) => {
          const c = getDayColor(h);
          return (
            <div
              key={h}
              style={{
                width: 20,
                height: 12,
                borderRadius: 4,
                background: c.bg,
                border: `1px solid ${c.border}`,
              }}
            />
          );
        })}

        <span style={{ fontSize: 10.5, opacity: 0.4 }}>10h+</span>
      </div>
    </div>
  );
}

function AnalyticsView({ tasks, range, setRange, customDates, setCustomDates }) {
  const points = useMemo(() => buildDailyPoints(tasks), [tasks]);

  return (
    <section className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeFilter
          range={range}
          setRange={setRange}
          customDates={customDates}
          setCustomDates={setCustomDates}
        />
      </div>

      <DashboardStats tasks={tasks} />

      {/* Daily Hours */}
      <DailyHoursBlock range={range} customDates={customDates} tasks={tasks} />

      {/* Productivity Chart */}
      <div className={clsx("rounded-3xl border p-6", "bg-[var(--card)]", "border-[var(--border)]")}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Productivity Curve</h3>
          <p className="mt-1 text-sm opacity-60">
            Daily productivity percent based on time spent vs target
          </p>
        </div>

        <ProductivityChart points={points} />
      </div>
    </section>
  );
}

export default AnalyticsView;
