import clsx from "clsx";

import {
  AnalyticsIcon,
  CalendarIcon,
  ExportIcon,
  PauseIcon,
  PinIcon,
  PlayIcon,
  ResetIcon,
  SavedIcon,
  SearchIcon,
  TasksIcon,
  TickIcon,
  TimerIcon,
} from "../../assets/icons";

const GROUP_ONE = [
  {
    n: "01",
    icon: <TasksIcon className="size-[15px]" />,
    title: "Add a Task",
    body: "Hit + Add Task. Double click the title or details to edit inline. Set priority and target time in minutes. ",
  },

  {
    n: "02",
    icon: (
      <div className="flex items-center justify-center gap-1.5">
        <PlayIcon className="size-[11px] shrink-0" />
        <PauseIcon className="size-[11px] shrink-0" />
        <ResetIcon className="size-[11px] shrink-0" />
      </div>
    ),
    title: "Run the Timer",
    body: "Press play to start and pause to stop. Double click the timer to edit it manually. Reset clears it to zero.",
  },

  {
    n: "03",
    icon: <TickIcon className="size-[15px]" />,
    title: "Track Progress",
    body: "The progress pill fills as time spent gets closer to your target. Complete tasks save the finish time.",
  },

  {
    n: "04",
    icon: <SearchIcon className="size-[15px]" />,
    title: "Filter and Sort",
    body: "Use Open, Closed, High, Medium, and Low filters together. Change between newest and oldest anytime.",
  },

  {
    n: "05",
    icon: <CalendarIcon className="size-[15px]" />,
    title: "Date Ranges",
    body: "Switch between Today, Yesterday, Last 7 Days, Last 30 Days, All Time, or choose custom dates.",
  },
];

const GROUP_TWO = [
  {
    n: "06",
    icon: <PinIcon className="size-[15px]" />,
    title: "Pin Tasks",
    body: "Pinned open tasks stay at the top even when sorting changes. Finished tasks unpin automatically.",
  },

  {
    n: "07",
    icon: <SavedIcon className="size-[15px]" />,
    title: "Saved Tasks",
    body: "Create reusable tasks in Saved Tasks and import them anytime into your active task list.",
  },

  {
    n: "08",
    icon: <AnalyticsIcon className="size-[15px]" />,
    title: "Analytics",
    body: "Check your productivity and compare spent time with target time across selected date ranges.",
  },

  {
    n: "09",
    icon: <ExportIcon className="size-[15px]" />,
    title: "Export",
    body: "Download your tasks as CSV or JSON. Filter by date range first to export only what you need.",
  },

  {
    n: "10",
    icon: <TimerIcon className="size-[15px]" />,
    title: "Completion Popups",
    body: "Popups appear when tasks reach 100 percent or when your daily progress is fully completed.",
  },
];

function GuideCard({ n, icon, title, body }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border px-5 py-4",
        "bg-[var(--card)]",
        "border-[var(--border)]",
        "transition-all duration-200",
        "hover:-translate-y-[1px] hover:border-[var(--accent-border)]",
      )}
    >
      {/* Card Content */}
      <div className="flex items-start gap-3">
        {/* Icon Wrapper */}
        <div
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-xl border",
            "bg-[var(--accent-bg)]",
            "border-[var(--accent-border)]",
            "text-[var(--accent)]",
            n === "02" ? "h-9 min-w-[56px] px-2" : "size-9",
          )}
        >
          {icon}
        </div>

        {/* Text Content */}
        <div className="min-w-0">
          {/* Header Row */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.08em] text-[var(--accent)] opacity-50">
              {n}
            </span>

            <p className="text-sm font-semibold text-[var(--text-h)]">{title}</p>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed opacity-60">{body}</p>
        </div>
      </div>
    </div>
  );
}

function GuideView() {
  return (
    <section
      style={{
        maxWidth: 1200,
        width: "100%",
      }}
    >
      {/* Guide Styles */}
      <style>{`
        .guide-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .guide-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .guide-col {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      {/* Guide Grid */}
      <div className="guide-grid">
        {/* Left Column */}
        <div className="guide-col">
          {GROUP_ONE.map(({ n, icon, title, body }) => (
            <GuideCard key={n} n={n} icon={icon} title={title} body={body} />
          ))}
        </div>

        {/* Right Column */}
        <div className="guide-col">
          {GROUP_TWO.map(({ n, icon, title, body }) => (
            <GuideCard key={n} n={n} icon={icon} title={title} body={body} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default GuideView;
